import axios from "axios"

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message ?? error.response?.data?.error
    if (typeof message === "string" && message.trim()) return message
    if (error.response?.status === 401) return "Войдите в аккаунт, чтобы продолжить."
    if (error.response?.status === 403) return "Недостаточно прав для этого действия."
    if (error.response?.status === 404) return "Запись не найдена."
    if (error.response?.status === 409)
      return "Данные изменились или действие уже выполнено. Обновите страницу."
    if (!error.response)
      return "Не удалось связаться с сервером. Проверьте соединение и повторите попытку."
  }
  return error instanceof Error ? error.message : "Не удалось выполнить запрос."
}
