import { ProjectStatus, SkillLevel, ApplicationType, ApplicationStatus } from "@/types/enums"

export const statusLabels: Record<ProjectStatus, string> = {
  RECRUITMENT: "Набор в команду",
  IN_PROGRESS: "В работе",
  ENDED: "Завершён",
}
export const statusTone: Record<ProjectStatus, string> = {
  RECRUITMENT: "blue",
  IN_PROGRESS: "green",
  ENDED: "",
}
export const levelLabels: Record<SkillLevel, string> = {
  BEGINNER: "Начальный",
  MIDDLE: "Средний",
  ADVANCED: "Продвинутый",
}
export const applicationTypeLabels: Record<ApplicationType, string> = {
  REQUEST: "Заявка",
  INVITATION: "Приглашение",
}
export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  PENDING: "На рассмотрении",
  ACCEPTED: "Принято",
  DECLINED: "Отклонено",
}
export function httpUrl(value?: string | null) {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return /^https?:$/.test(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}
export const loginUrl = (path: string) => `/login?callbackUrl=${encodeURIComponent(path)}`
export function parseProjectId(value: string) {
  return /^\d+$/.test(value) &&
    Number.isSafeInteger(Number(value)) &&
    Number(value) > 0 &&
    Number(value) <= 2147483647
    ? Number(value)
    : null
}
