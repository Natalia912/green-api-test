import { createContext } from "react";
import type { Credentials } from "@/shared/domain";

export interface SessionValue {
  credentials: Credentials | null;
  persistent: boolean;
  login: (credentials: Credentials, remember: boolean) => void;
  logout: () => void;
}

export const SessionContext = createContext<SessionValue | null>(null);
