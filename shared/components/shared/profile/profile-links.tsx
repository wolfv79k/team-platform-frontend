import { socialFields, webLink } from "@/shared/lib/profile-settings"
import type { ProfileView } from "@/services/users.api"

export default function ProfileLinks({
  website,
  socialLinks,
}: Pick<ProfileView, "website" | "socialLinks">) {
  const links = [
    { label: "Сайт / резюме", value: website },
    ...socialFields.map(({ key, label }) => ({ label, value: socialLinks?.[key] })),
  ].flatMap(({ label, value }) => {
    if (!value) return []
    try {
      const url = new URL(webLink(value))
      if (url.protocol === "http:" || url.protocol === "https:") return [{ label, href: url.href }]
    } catch {
      return []
    }
    return []
  })

  if (!links.length) return null
  return (
    <ul
      aria-label="Ссылки профиля"
      className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm"
    >
      {links.map(({ label, href }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4"
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  )
}
