import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { chatPath, routes, useSession } from "@/shared/model";
import {
  clearStoredChats,
  readChatNumbers,
  saveChatNumbers,
} from "../model/chat-storage";

export function ChatList() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { logout, persistent } = useSession();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [chatNumbers, setChatNumbers] = useState<string[]>(() =>
    readChatNumbers(persistent),
  );

  function createChat(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      setError("Введите номер с кодом страны (от 10 до 15 цифр).");
      return;
    }
    setError("");
    setChatNumbers((current) => {
      const next = [digits, ...current.filter((item) => item !== digits)];
      saveChatNumbers(next, persistent);
      return next;
    });
    setPhone("");
    navigate(chatPath(digits));
  }

  function handleLogout() {
    clearStoredChats();
    logout();
    navigate(routes.login, { replace: true });
  }

  return (
    <section className="wa-sidebar">
      <header className="sidebar-heading">
        <h1>Чаты</h1>
        <button className="logout-button" onClick={handleLogout}>
          Выйти
        </button>
      </header>
      <form className="new-chat-form" onSubmit={createChat}>
        <label htmlFor="recipient-phone">Новый чат</label>
        <div className="new-chat-fields">
          <input
            id="recipient-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Номер WhatsApp, например 79991234567"
            inputMode="tel"
          />
          <button type="submit" aria-label="Создать чат">
            +
          </button>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
      {chatNumbers.length > 0 ? (
        <nav className="contact-list" aria-label="Список чатов">
          {chatNumbers.map((number) => (
            <Link
              className={`contact-row ${chatId === number ? "selected-contact" : ""}`}
              key={number}
              to={chatPath(number)}
            >
              <span className="avatar green">WA</span>
              <span className="contact-copy">
                <span className="contact-top">
                  <strong>+{number}</strong>
                </span>
                <span className="contact-bottom">
                  <span>WhatsApp</span>
                </span>
              </span>
            </Link>
          ))}
        </nav>
      ) : (
        <div className="chat-list-hint">
          Введите номер получателя, чтобы начать переписку.
        </div>
      )}
    </section>
  );
}
