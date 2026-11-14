import Link from "next/link"
import { getViewer } from "@/services/viewer"
import { ProfileAvatar } from "@/shared/components/shared/profile/profile-media"
import ThemeButton from "@/shared/components/shared/layout/theme-button"
import { sections } from "@/shared/lib/site-sections"

export default async function GuestHeader() {
  const viewer = await getViewer()

  return (
    <header className="guest-header">
      <Link href="/" className="logo">
        <span className="brand-mark" />
        <span>Название</span>
      </Link>
      <nav aria-label="Разделы">
        <Link href="/">Главная</Link>
        {sections.map(({ href, label }) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </nav>
      <div>
        <ThemeButton compact className="icon-btn" />
        {viewer ? (
          <Link href="/user" className="btn secondary small" aria-label="Мой профиль">
            <ProfileAvatar name={viewer.name} url={viewer.avatarUrl} size={24} />
            <span>Мой профиль</span>
          </Link>
        ) : (
          <>
            <Link className="btn secondary small" href="/login">
              Войти
            </Link>
            <Link className="btn primary small" href="/register">
              Создать профиль
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
