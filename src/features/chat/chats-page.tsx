import { useParams } from "react-router";
import { ChatConversation } from "./components/chat-conversation";
import { ChatList } from "./components/chat-list";
import { EmptyChat } from "./components/empty-chat";
import "./chats-page.css";

export function ChatsPage() {
  const { chatId } = useParams();

  return (
    <main className={`wa-shell ${chatId ? "has-chat" : "no-chat"}`}>
      <ChatList />
      {chatId ? <ChatConversation key={chatId} chatId={chatId} /> : <EmptyChat />}
    </main>
  );
}
