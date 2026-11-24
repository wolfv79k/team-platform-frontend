"use server"
import { signOut } from "@/auth"
import { getAdminAccess } from "@/services/admin-access.server"
import { authApi } from "@/services/auth.api"
import { isKind, type Kind } from "@/shared/lib/admin-catalog"
import { ProjectStatus } from "@/types/enums"

export async function leaveAccount() {
  await signOut({ redirectTo: "/login" })
}

export async function saveAdminRecord(
  kind: Kind,
  operation: "create" | "edit" | "delete",
  id: number | null,
  form: FormData,
) {
  const access = await getAdminAccess()
  if (access.state !== "admin")
    return {
      error:
        access.state === "unavailable"
          ? "Сервер не подтвердил права. Повторите попытку."
          : "Доступ закрыт. Проверьте аккаунт и обновите страницу.",
    }
  if (!isKind(kind) || !["create", "edit", "delete"].includes(operation))
    return { error: "Неизвестное действие." }
  if (operation !== "create" && (!Number.isSafeInteger(id) || !id || id < 1))
    return { error: "Некорректный номер записи." }
  const body: Record<string, string | number> = {}
  if (operation !== "delete") {
    const name = form.get("name")
    const description = form.get("description")
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 100 ||
      typeof description !== "string"
    )
      return { error: "Введите название длиной до 100 символов и проверьте описание." }
    body.name = name.trim()
    body.description = description.trim()
    if (kind === "projects" && operation === "create") {
      const role = Number(form.get("roleId"))
      if (!Number.isSafeInteger(role) || role < 1) return { error: "Выберите роль автора проекта." }
      body.roleId = role
    }
    if (kind === "projects" && operation === "edit") {
      const status = form.get("status")
      if (!Object.values(ProjectStatus).some((value) => value === status))
        return { error: "Выберите статус проекта." }
      body.status = String(status)
    }
  }
  try {
    const response = await authApi(operation === "create" ? kind : `${kind}/${id}`, {
      method: { create: "POST", edit: "PATCH", delete: "DELETE" }[operation],
      headers: { Authorization: `Bearer ${access.token}`, "Content-Type": "application/json" },
      body: operation === "delete" ? undefined : JSON.stringify(body),
    })
    if (response.ok) return { success: true }
    if (response.status === 403) return { error: "Изменение доступно только владельцу записи." }
    if (response.status === 401) return { error: "Сессия истекла. Войдите снова." }
    if (response.status === 404) return { error: "Запись уже недоступна. Обновите таблицу." }
    const details = await response.json().catch(() => null)
    return {
      error:
        response.status < 500 && typeof details?.error === "string"
          ? details.error
          : "Сервер отклонил изменение.",
    }
  } catch {
    return { error: "Не удалось подтвердить результат. Проверьте таблицу перед повтором." }
  }
}
