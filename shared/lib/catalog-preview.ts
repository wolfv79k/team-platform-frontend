import { catalogPreview } from "@/shared/data/catalog-preview"

const people = catalogPreview.samplePeople as Record<number, { name: string; username: string }>
export const person = (id: number) =>
  id === 1 ? { name: "Даниил Морозов", username: "danil_m" } : people[id]
export const plural = (n: number, one: string, few: string, many: string) => {
  const category = new Intl.PluralRules("ru").select(n)
  return n + " " + (category === "one" ? one : category === "few" ? few : many)
}

export const eventIsPast = (event: (typeof catalogPreview.events)[number]) =>
  event.endDate < "2026-11-09"
