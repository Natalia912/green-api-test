import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ChatMessage } from "./chat-storage";
import { readChatMessages, saveChatMessages } from "./chat-storage";
import {
  deleteNotification,
  receiveNotification,
  sendTextMessage,
} from "./chat-api";
import type { GreenApiNotification } from "./chat-api";
import type { Credentials } from "@/shared/domain";
import { useSession } from "@/shared/model";

function notificationText(notification: GreenApiNotification) {
  const data = notification.body?.messageData;
  if (data?.typeMessage === "textMessage")
    return data.textMessageData?.textMessage;
  if (data?.typeMessage === "extendedTextMessage")
    return data.extendedTextMessageData?.text;
  return undefined;
}

function currentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useChatMessages(chatId: string) {
  const { credentials, persistent } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    readChatMessages(chatId, persistent),
  );
  const [error, setError] = useState("");
  const [receiveError, setReceiveError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!credentials) return;
    return startReceivingMessages(
      credentials,
      chatId,
      persistent,
      setMessages,
      setReceiveError,
    );
  }, [chatId, credentials, persistent]);

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || !credentials || sending) return false;
      setSending(true);
      setError("");
      try {
        const result = await sendTextMessage(
          credentials,
          `${chatId}@c.us`,
          message,
        );
        setMessages((current) => {
          if (
            result.idMessage &&
            current.some((item) => item.id === result.idMessage)
          )
            return current;
          const next = [
            ...current,
            {
              id: result.idMessage ?? crypto.randomUUID(),
              text: message,
              time: currentTime(),
              outgoing: true,
            },
          ];
          saveChatMessages(chatId, next, persistent);
          return next;
        });
        return true;
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Не удалось отправить сообщение.",
        );
        return false;
      } finally {
        setSending(false);
      }
    },
    [chatId, credentials, persistent, sending],
  );

  return { messages, error, receiveError, sending, send };
}

function startReceivingMessages(
  credentials: Credentials,
  chatId: string,
  persistent: boolean,
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  setReceiveError: (message: string) => void,
) {
  let active = true;
  let requestController: AbortController | undefined;
  let resumeVisibilityWait: (() => void) | undefined;

  const onVisibilityChange = () => {
    if (document.hidden) requestController?.abort();
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  function waitUntilVisible() {
    return new Promise<void>((resolve) => {
      const onChange = () => {
        if (active && document.hidden) return;
        document.removeEventListener("visibilitychange", onChange);
        resumeVisibilityWait = undefined;
        resolve();
      };
      resumeVisibilityWait = onChange;
      document.addEventListener("visibilitychange", onChange);
      onChange();
    });
  }

  async function poll() {
    while (active) {
      if (document.hidden) {
        await waitUntilVisible();
        if (!active) return;
      }

      requestController = new AbortController();
      try {
        const notification = await receiveNotification(
          credentials,
          requestController.signal,
        );
        if (!active) return;

        setReceiveError("");
        if (notification) {
          persistTextNotification(
            notification,
            chatId,
            persistent,
            setMessages,
          );
          await deleteNotification(credentials, notification.receiptId);
        }
      } catch (reason) {
        if (!active) return;
        if (document.hidden && requestController.signal.aborted) continue;

        setReceiveError(
          reason instanceof Error
            ? reason.message
            : "Ошибка получения сообщений.",
        );
      }
    }
  }

  void poll();
  return () => {
    active = false;
    requestController?.abort();
    resumeVisibilityWait?.();
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}

function persistTextNotification(
  notification: GreenApiNotification,
  activeChatId: string,
  persistent: boolean,
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
) {
  const sender =
    notification.body?.senderData?.chatId ??
    notification.body?.senderData?.sender;
  const text = notificationText(notification);
  const typeWebhook = notification.body?.typeWebhook;
  const outgoing =
    typeWebhook === "outgoingMessageReceived" ||
    typeWebhook === "outgoingAPIMessageReceived";
  if (
    (typeWebhook !== "incomingMessageReceived" && !outgoing) ||
    !sender ||
    !text
  )
    return;

  const senderNumber = sender.split("@")[0];
  const incoming: ChatMessage = {
    id: notification.body?.idMessage ?? String(notification.receiptId),
    text,
    time: currentTime(),
    outgoing,
  };
  const stored = readChatMessages(senderNumber, persistent);
  if (!stored.some((message) => message.id === incoming.id))
    saveChatMessages(senderNumber, [...stored, incoming], persistent);
  if (senderNumber === activeChatId) {
    setMessages((current) =>
      current.some((message) => message.id === incoming.id)
        ? current
        : [...current, incoming],
    );
  }
}
