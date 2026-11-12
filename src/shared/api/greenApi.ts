import { LoginError, type Credentials } from "@/shared/domain";
import { GREEN_API_URL } from "@/shared/config";

const TIMEOUT_MS = 10_000;

export async function checkCredentials(
  { idInstance, apiTokenInstance }: Credentials,
  signal?: AbortSignal,
): Promise<void> {
  const url = `${GREEN_API_URL}/waInstance${encodeURIComponent(
    idInstance,
  )}/getStateInstance/${encodeURIComponent(apiTokenInstance)}`;

  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), TIMEOUT_MS);
  signal?.addEventListener("abort", () => timeout.abort());

  let res: Response;
  try {
    res = await fetch(url, { signal: timeout.signal });
  } catch (e) {
    if (signal?.aborted) throw e;
    if (timeout.signal.aborted) {
      throw new LoginError(
        "timeout",
        "Сервер не ответил за 10 секунд. Попробуйте ещё раз.",
      );
    }
    throw new LoginError(
      "network",
      "Не удалось связаться с GREEN-API. Проверьте интернет-соединение.",
    );
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 401 || res.status === 403 || res.status === 400) {
    throw new LoginError(
      "invalid_credentials",
      "Неверный idInstance или apiTokenInstance.",
    );
  }
  if (res.status === 429) {
    throw new LoginError(
      "rate_limited",
      "Слишком много запросов. Подождите немного.",
    );
  }
  if (!res.ok) {
    throw new LoginError("unknown", `Ошибка сервера (код ${res.status}).`);
  }

  let data: { stateInstance?: string };
  try {
    data = await res.json();
  } catch {
    throw new LoginError("unknown", "Сервер вернул некорректный ответ.");
  }

  if (data.stateInstance !== "authorized") {
    throw new LoginError(
      "not_authorized",
      `Инстанс не авторизован (статус: ${data.stateInstance ?? "неизвестен"}). Авторизуйте аккаунт в личном кабинете GREEN-API.`,
    );
  }
}
