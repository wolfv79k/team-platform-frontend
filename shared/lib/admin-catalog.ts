import { statusLabels } from "./project-display"
import type { ProjectStatus } from "@/types/enums"

export const kinds = ["projects", "ideas", "communities"] as const
export type Kind = (typeof kinds)[number]
export function isKind(value: unknown): value is Kind {
  return kinds.some((kind) => kind === value)
}
export const catalog = {
  projects: { title: "Проекты", single: "Проект", add: "Добавить проект", color: "#cf54ff" },
  ideas: { title: "Идеи", single: "Идея", add: "Добавить идею", color: "#35c9ff" },
  communities: {
    title: "Сообщества",
    single: "Сообщество",
    add: "Добавить сообщество",
    color: "#8a8cff",
  },
}
export interface CatalogRow {
  kind: Kind
  id: number
  name: string
  description: string | null
  createdAt: string
  ownerId: number
  username: string
  status?: ProjectStatus
  converted?: boolean
  members?: number
}
export function detailLabel(row: CatalogRow) {
  if (row.status) return statusLabels[row.status]
  if (row.kind === "ideas") return row.converted ? "Есть проект" : "Идея"
  return `Участники · ${row.members ?? 0}`
}
const dateOptions = { day: "numeric", month: "short", timeZone: "Europe/Moscow" } as const
const dayFormatter = new Intl.DateTimeFormat("ru", dateOptions)
const dateFormatter = new Intl.DateTimeFormat("ru", { ...dateOptions, year: "numeric" })
export function shortDate(value: string | number, includeYear = false) {
  return (includeYear ? dateFormatter : dayFormatter).format(new Date(value))
}
export const int = (value: number) => value.toLocaleString("ru-RU")
