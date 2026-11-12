import { Icon } from "./icon";

export function EmptyChat() {
  return (
    <section className="wa-empty" aria-label="Чат не выбран">
      <div className="empty-illustration"><div className="empty-chat-icon"><Icon name="chat" size={42}/><span>✓</span></div></div>
      <h2>Ваши чаты</h2>
      <p>Введите номер WhatsApp слева, чтобы начать переписку</p>
    </section>
  );
}
