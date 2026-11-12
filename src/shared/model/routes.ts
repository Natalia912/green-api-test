export const routes = {
  login: "/login",
  chats: "/chats",
  chat: "/chats/:chatId",
} as const;

export const chatPath = (chatId: string) => `/chats/${encodeURIComponent(chatId)}`;
