import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Credentials } from "@/shared/domain";
import { SessionContext } from "./session-context";

const KEY = "greenapi_credentials";
const STORAGE_TYPES = ["localStorage", "sessionStorage"] as const;

function parseCredentials(value: unknown): Credentials | null {
  if (typeof value !== "object" || value === null) return null;

  const credentials = value as Partial<Credentials>;
  if (
    typeof credentials.idInstance !== "string" ||
    credentials.idInstance.trim() === "" ||
    typeof credentials.apiTokenInstance !== "string" ||
    credentials.apiTokenInstance.trim() === ""
  ) return null;

  return {
    idInstance: credentials.idInstance,
    apiTokenInstance: credentials.apiTokenInstance,
  };
}

function getStorage(type: (typeof STORAGE_TYPES)[number]): Storage | null {
  try {
    return typeof window === "undefined" ? null : window[type];
  } catch {
    return null;
  }
}

function readStored(): Credentials | null {
  for (const type of STORAGE_TYPES) {
    const storage = getStorage(type);
    if (!storage) continue;

    try {
      const raw = storage.getItem(KEY);
      if (!raw) continue;

      const credentials = parseCredentials(JSON.parse(raw) as unknown);
      if (credentials) return credentials;
      storage.removeItem(KEY);
    } catch {
      console.warn(`Failed to read credentials from ${type}.`);
    }
  }

  return null;
}

function hasPersistentSession() {
  const storage = getStorage("localStorage");
  if (!storage) return false;
  try {
    const raw = storage.getItem(KEY);
    return raw ? parseCredentials(JSON.parse(raw) as unknown) !== null : false;
  } catch {
    return false;
  }
}

function clearStored() {
  for (const type of STORAGE_TYPES) {
    const storage = getStorage(type);
    if (!storage) continue;

    try {
      storage.removeItem(KEY);
    } catch {
      // Continue clearing the other storage even if one is unavailable.
    }
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<Credentials | null>(readStored);
  const [persistent, setPersistent] = useState(hasPersistentSession);

  const login = useCallback((nextCredentials: Credentials, remember: boolean) => {
    clearStored();
    const storage = getStorage(remember ? "localStorage" : "sessionStorage");

    try {
      storage?.setItem(KEY, JSON.stringify(nextCredentials));
    } catch {
      // Keep the in-memory session when persistence is unavailable.
    }

    setCredentials(nextCredentials);
    setPersistent(remember);
  }, []);

  const logout = useCallback(() => {
    clearStored();
    setCredentials(null);
    setPersistent(false);
  }, []);

  const value = useMemo(
    () => ({ credentials, persistent, login, logout }),
    [credentials, persistent, login, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
