import { useEffect, useRef, useState } from "react";
import type { FocusEvent, SubmitEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import { checkCredentials } from "@/shared/api";
import { LoginError } from "@/shared/domain";
import { routes, useSession } from "@/shared/model";
import { LoginForm } from "./components/login-form";
import type { LoginErrors, LoginField } from "./model/types";
import { validateCredentials } from "./model/validate-credentials";
import "./auth-page.css";

export function LoginPage() {
  const { credentials, login } = useSession();
  const navigate = useNavigate();
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [remember, setRemember] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<LoginField, boolean>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  if (credentials) return <Navigate to={routes.chats} replace />;

  const validationErrors = validateCredentials(
    idInstance.trim(),
    apiTokenInstance.trim(),
  );
  const errors: LoginErrors = {};
  if (touched.idInstance) errors.idInstance = validationErrors.idInstance;
  if (touched.apiTokenInstance)
    errors.apiTokenInstance = validationErrors.apiTokenInstance;

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setTouched({ idInstance: true, apiTokenInstance: true });
    if (Object.keys(validationErrors).length > 0) return;

    const nextCredentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    };

    setSubmitError(null);
    setLoading(true);
    abortRef.current = new AbortController();
    try {
      await checkCredentials(nextCredentials, abortRef.current.signal);
      login(nextCredentials, remember);
      navigate(routes.chats, { replace: true });
    } catch (error) {
      if (abortRef.current.signal.aborted) return;
      setSubmitError(
        error instanceof LoginError
          ? error.message
          : "Что-то пошло не так. Попробуйте ещё раз.",
      );
      setLoading(false);
    }
  }

  function onBlur(event: FocusEvent<HTMLInputElement>) {
    const field = event.currentTarget.id as LoginField;
    setTouched((current) => ({ ...current, [field]: true }));
  }

  return (
    <LoginForm
      idInstance={idInstance}
      apiTokenInstance={apiTokenInstance}
      remember={remember}
      loading={loading}
      errors={errors}
      submitError={submitError}
      onSubmit={onSubmit}
      onIdInstanceChange={(event) => setIdInstance(event.target.value)}
      onApiTokenChange={(event) => setApiTokenInstance(event.target.value)}
      onRememberChange={(event) => setRemember(event.target.checked)}
      onBlur={onBlur}
    />
  );
}
