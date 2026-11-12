export type LoginErrorCode =
  | "invalid_credentials"
  | "not_authorized"
  | "rate_limited"
  | "network"
  | "timeout"
  | "unknown";

export class LoginError extends Error {
  code: LoginErrorCode;

  constructor(code: LoginErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
