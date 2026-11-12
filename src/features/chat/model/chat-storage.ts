export type ChatMessage = { id: string; text: string; time: string; outgoing: boolean };

function getChatStorage(persistent: boolean) {
  return window[persistent ? "localStorage" : "sessionStorage"];
}

function readJson(key: string, persistent: boolean): unknown {
  try { return JSON.parse(getChatStorage(persistent).getItem(key) ?? "null"); } catch { return null; }
}

export function readChatNumbers(persistent: boolean): string[] {
  const stored = readJson("greenapi_chats", persistent);
  return Array.isArray(stored) ? stored.filter((item): item is string => typeof item === "string" && /^\d{10,15}$/.test(item)) : [];
}

export function saveChatNumbers(numbers: string[], persistent: boolean) {
  try { getChatStorage(persistent).setItem("greenapi_chats", JSON.stringify(numbers)); } catch { /* Keep the current session usable. */ }
}

export function readChatMessages(chatId: string, persistent: boolean): ChatMessage[] {
  const stored = readJson(`greenapi_messages_${chatId}`, persistent);
  return Array.isArray(stored) ? stored.filter((item): item is ChatMessage =>
    typeof item === "object" && item !== null &&
    "id" in item && typeof item.id === "string" &&
    "text" in item && typeof item.text === "string" &&
    "time" in item && typeof item.time === "string" &&
    "outgoing" in item && typeof item.outgoing === "boolean",
  ) : [];
}

export function saveChatMessages(chatId: string, messages: ChatMessage[], persistent: boolean) {
  try { getChatStorage(persistent).setItem(`greenapi_messages_${chatId}`, JSON.stringify(messages)); } catch { /* Keep the current conversation usable. */ }
}

export function clearStoredChats() {
  for (const storageType of ["localStorage", "sessionStorage"] as const) {
    try {
      const storage = window[storageType];
      for (let index = storage.length - 1; index >= 0; index -= 1) {
        const key = storage.key(index);
        if (key === "greenapi_chats" || key?.startsWith("greenapi_messages_")) {
          storage.removeItem(key);
        }
      }
    } catch {
      // Continue clearing the other storage if one browser store is unavailable.
    }
  }
}
