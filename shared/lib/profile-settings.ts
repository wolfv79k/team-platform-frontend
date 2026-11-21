import { SocialPlatform } from "@/types/enums"
import type { UserSocialLink } from "@/types/models"

export const socialFields = [
  {
    key: "telegram",
    platform: SocialPlatform.TELEGRAM,
    label: "Telegram",
    icon: "/Telegram.svg",
    placeholder: "t.me/…",
  },
  {
    key: "linkedin",
    platform: SocialPlatform.LINKEDIN,
    label: "LinkedIn",
    icon: "/linkedIn.svg",
    placeholder: "linkedin.com/in/…",
  },
  { key: "vk", platform: SocialPlatform.VK, label: "VK", icon: "/icons/social/vk.svg", placeholder: "vk.com/…" },
  {
    key: "behance",
    platform: SocialPlatform.BEHANCE,
    label: "Behance",
    icon: "/icons/social/behance.svg",
    placeholder: "behance.net/…",
  },
  {
    key: "github",
    platform: SocialPlatform.GITHUB,
    label: "GitHub",
    icon: "/GitHub.svg",
    placeholder: "github.com/…",
  },
  {
    key: "discord",
    platform: SocialPlatform.DISCORD,
    label: "Discord",
    icon: "/icons/social/discord.svg",
    placeholder: "discord.com/…",
  },
  {
    key: "other",
    platform: SocialPlatform.OTHER,
    label: "Другая ссылка",
    icon: undefined,
    placeholder: "https://…",
  },
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
  resume?: string | null
  socialLinks: Partial<Record<SocialKey, string>> | null
  avatarUrl: string | null
  userSkills: { skillId: number }[]
}

export function profileSocialLinks(
  links: UserSocialLink[] | ProfileSettings["socialLinks"] | undefined,
) {
  if (!Array.isArray(links)) return links ?? {}
  const result: NonNullable<ProfileSettings["socialLinks"]> = {}
  for (const { key, platform } of socialFields) {
    const link = links.find((item) => item.platform === platform)
    if (link) result[key] = link.url
  }
  return result
}

export function validProfileLink(input: unknown): input is string {
  if (typeof input !== "string") return false
  if (!input.trim()) return true
  try {
    const value = webLink(input)
    const url = new URL(value)
    return value.length <= 500 && (url.protocol === "https:" || url.protocol === "http:")
  } catch {
    return false
  }
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
