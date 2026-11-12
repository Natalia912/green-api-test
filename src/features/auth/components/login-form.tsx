import type { ChangeEvent, FocusEvent, SubmitEvent } from "react";
import type { LoginErrors, LoginField } from "../model/types";

type LoginFormProps = {
  idInstance: string;
  apiTokenInstance: string;
  remember: boolean;
  loading: boolean;
  errors: LoginErrors;
  submitError: string | null;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onIdInstanceChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onApiTokenChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRememberChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
};

export function LoginForm({
  idInstance,
  apiTokenInstance,
  remember,
  loading,
  errors,
  submitError,
  onSubmit,
  onIdInstanceChange,
  onApiTokenChange,
  onRememberChange,
  onBlur,
}: LoginFormProps) {
  function fieldError(field: LoginField) {
    return errors[field];
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <h1 className="auth-title">Вход в чат</h1>
        <p className="auth-hint">
          Введите данные инстанса из личного кабинета GREEN-API.
        </p>

        <div
          className={`auth-field ${fieldError("idInstance") ? "has-error" : ""}`}
        >
          <label htmlFor="idInstance">idInstance</label>
          <input
            id="idInstance"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            value={idInstance}
            disabled={loading}
            aria-invalid={!!fieldError("idInstance")}
            aria-describedby="idInstance-error"
            onChange={onIdInstanceChange}
            onBlur={onBlur}
          />
          <span id="idInstance-error" className="auth-error" role="alert">
            {fieldError("idInstance")}
          </span>
        </div>

        <div
          className={`auth-field ${fieldError("apiTokenInstance") ? "has-error" : ""}`}
        >
          <label htmlFor="apiTokenInstance">apiTokenInstance</label>
          <input
            id="apiTokenInstance"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={apiTokenInstance}
            disabled={loading}
            aria-invalid={!!fieldError("apiTokenInstance")}
            aria-describedby="apiTokenInstance-error"
            onChange={onApiTokenChange}
            onBlur={onBlur}
          />
          <span id="apiTokenInstance-error" className="auth-error" role="alert">
            {fieldError("apiTokenInstance")}
          </span>
        </div>

        <label className="auth-remember">
          <input
            type="checkbox"
            checked={remember}
            disabled={loading}
            onChange={onRememberChange}
          />
          Запомнить на этом устройстве
        </label>

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "Проверяем…" : "Войти"}
        </button>

        {submitError && (
          <div className="auth-submit-error" role="alert">
            {submitError}
          </div>
        )}
      </form>
    </main>
  );
}
