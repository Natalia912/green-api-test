import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { Link } from "react-router";
import { useChatMessages } from "../model/use-chat-messages";
import { Icon } from "./icon";

export function ChatConversation({ chatId }: { chatId: string }) {
  const [draft, setDraft] = useState("");
  const { messages, error, receiveError, sending, send } =
    useChatMessages(chatId);
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    areaRef.current?.scrollTo({
      top: areaRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await send(draft)) setDraft("");
  }

  return (
    <section className="wa-conversation" aria-label={`Переписка: +${chatId}`}>
      <header className="conversation-header">
        <Link
          className="mobile-back"
          to="/chats"
          aria-label="Вернуться к списку чатов"
        >
          <Icon name="back" size={21} />
        </Link>
        <span className="avatar green large-avatar">WA</span>
        <div className="conversation-person">
          <strong>+{chatId}</strong>
          <small className={receiveError ? "receive-error" : ""}>
            {receiveError || "WhatsApp"}
          </small>
        </div>
      </header>
      <div className="message-area" ref={areaRef}>
        {messages.length === 0 && (
          <div className="conversation-empty">
            Сообщения с этого номера появятся здесь.
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`bubble ${message.outgoing ? "outgoing" : "incoming"}`}
          >
            {message.text}
            <small>{message.time}</small>
          </div>
        ))}
      </div>
      <form className="composer-wrap" onSubmit={handleSubmit}>
        {error && (
          <p className="form-error send-error" role="alert">
            {error}
          </p>
        )}
        <div className="composer">
          <input
            className="message-input"
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Введите сообщение"
            aria-label="Введите сообщение"
          />
          <button
            className="send-button"
            type="submit"
            disabled={sending || !draft.trim()}
            aria-label="Отправить сообщение"
          >
            <Icon name="send" size={19} />
          </button>
        </div>
      </form>
    </section>
  );
}
