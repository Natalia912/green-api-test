import type { LoginErrors } from "./types";

export function validateCredentials(
  idInstance: string,
  apiTokenInstance: string,
): LoginErrors {
  const errors: LoginErrors = {};

  if (!idInstance) errors.idInstance = "Введите idInstance";
  else if (!/^\d{4,}$/.test(idInstance))
    errors.idInstance = "idInstance состоит только из цифр";

  if (!apiTokenInstance) errors.apiTokenInstance = "Введите apiTokenInstance";
  else if (/\s/.test(apiTokenInstance))
    errors.apiTokenInstance = "В токене не должно быть пробелов";
  else if (apiTokenInstance.length < 10)
    errors.apiTokenInstance = "Токен слишком короткий";

  return errors;
}
