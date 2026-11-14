export const socialFields = [
  { key: "telegram", label: "Telegram", icon: "/Telegram.svg", placeholder: "t.me/…" },
  { key: "linkedin", label: "LinkedIn", icon: "/linkedIn.svg", placeholder: "linkedin.com/in/…" },
  { key: "instagram", label: "Instagram", icon: "/Instagram.svg", placeholder: "instagram.com/…" },
  { key: "figma", label: "Figma", icon: "/Figma.svg", placeholder: "figma.com/@…" },
  { key: "github", label: "GitHub", icon: "/GitHub.svg", placeholder: "github.com/…" },
  { key: "other", label: "Другая ссылка", icon: undefined, placeholder: "https://…" },
] as const

type SocialKey = (typeof socialFields)[number]["key"]

export type ProfileSettings = {
  id?: number
  username: string
  name: string | null
  firstName: string | null
  lastName: string | null
  bio: string | null
  locationId: number | null
  gender: string | null
  website: string | null
  socialLinks: Partial<Record<SocialKey, string>> | null
  avatarUrl: string | null
  userSkills: { skillId: number }[]
}

export const avatarTypes = ["image/jpeg", "image/png", "image/webp"]
export const maxAvatarSize = 4 * 1024 * 1024

export function avatarError(file: File) {
  if (!file.size || !avatarTypes.includes(file.type))
    return "Выберите изображение JPEG, PNG или WebP."
  if (file.size > maxAvatarSize) return "Размер аватара не должен превышать 4 МБ."
}

export function webLink(input: string) {
  const value = input.trim()
  return value && !/^[a-z][a-z\d+.-]*:/i.test(value) ? `https://${value}` : value
}
