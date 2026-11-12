import type { Credentials } from "@/shared/domain";
import { GREEN_API_URL } from "@/shared/config";

export type GreenApiNotification = {
  receiptId: number;
  body?: {
    typeWebhook?: string;
    idMessage?: string;
    senderData?: { chatId?: string; sender?: string };
    messageData?: {
      typeMessage?: string;
      textMessageData?: { textMessage?: string };
      extendedTextMessageData?: { text?: string };
    };
  };
};

function methodUrl(credentials: Credentials, method: string) {
  return `${GREEN_API_URL}/waInstance${encodeURIComponent(credentials.idInstance)}/${method}/${encodeURIComponent(credentials.apiTokenInstance)}`;
}

export async function sendTextMessage(
  credentials: Credentials,
  chatId: string,
  message: string,
) {
  const response = await fetch(methodUrl(credentials, "sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, message }),
  });
  if (!response.ok)
    throw new Error(`Не удалось отправить сообщение (${response.status}).`);
  return response.json() as Promise<{ idMessage?: string }>;
}

export async function receiveNotification(
  credentials: Credentials,
  signal?: AbortSignal,
) {
  const response = await fetch(
    `${methodUrl(credentials, "receiveNotification")}?receiveTimeout=60`,
    { signal },
  );
  const text = await response.text();
  if (!response.ok) {
    let payload: { code?: string; message?: string; error?: string } | undefined;
    try {
      payload = JSON.parse(text) as typeof payload;
    } catch {
      /* Use the actionable fallback. */
    }
    throw new Error(
      [payload?.code, payload?.message ?? payload?.error].filter(Boolean).join(": ") ||
        `Ошибка получения сообщений (${response.status}). Проверьте настройки HTTP API уведомлений GREEN-API.`,
    );
  }
  if (!text.trim()) return null;
  const result: unknown = JSON.parse(text);
  if (result === null) return null;
  if (typeof result !== "object" || Array.isArray(result))
    throw new Error("GREEN-API вернул уведомление в неожиданном формате.");
  const notification = result as Partial<GreenApiNotification> & {
    code?: string;
    status?: string;
    message?: string;
  };
  if (notification.status === "error")
    throw new Error(
      [notification.code, notification.message]
        .filter(Boolean)
        .join(": ") || "GREEN-API вернул ошибку получения сообщений.",
    );
  if (
    !Number.isInteger(notification.receiptId) ||
    typeof notification.body !== "object" ||
    notification.body === null ||
    Array.isArray(notification.body)
  )
    throw new Error("GREEN-API вернул уведомление в неожиданном формате.");
  return notification as GreenApiNotification;
}

export async function deleteNotification(
  credentials: Credentials,
  receiptId: number,
) {
  const url = `${GREEN_API_URL}/waInstance${encodeURIComponent(credentials.idInstance)}/deleteNotification/${encodeURIComponent(credentials.apiTokenInstance)}/${receiptId}`;
  const response = await fetch(url, { method: "DELETE" });
  if (!response.ok)
    throw new Error(`Не удалось подтвердить уведомление (${response.status}).`);
}
