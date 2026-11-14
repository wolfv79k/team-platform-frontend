export type ProfileActivityItem = {
  id: string
  type: string
  title: string
  detail?: string | null
  occurredAt: string | null
}

export type ProfileActivity = {
  items: ProfileActivityItem[]
  complete: boolean
}
