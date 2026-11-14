"use client"

import "@/app/styles/browse-layout.css"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, Bell, Globe } from "lucide-react"
import { useState } from "react"
import ThemeButton from "./theme-button"
import { ProfileAvatar } from "@/shared/components/shared/profile/profile-media"
import { useViewer } from "./viewer-provider"

import { sections } from "@/shared/lib/site-sections"

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="logo">
      <span className="brand-mark" />
      <span>Название</span>
    </Link>
  )
}

export function BrowseLayout({
  title,
  back,
  children,
}: {
  title: string
  back?: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const viewer = useViewer()
  const [notifications, setNotifications] = useState(false)
  const navigation = sections.map(({ href, label, Icon }) => {
    const active = pathname === href || pathname.startsWith(href + "/")
    return (
      <Link
        key={href}
        href={href}
        className={`nav-link${active ? " selected" : ""}`}
        aria-current={active ? "page" : undefined}
      >
        <span className="icon">
          <Icon strokeWidth={1.65} />
        </span>
        <span>{label}</span>
      </Link>
    )
  })

  return (
    <div className="site-surface">
      <div className="app-layout browse-layout">
        <aside className="left-rail">
          <Brand href={viewer ? "/user" : "/"} />
          <nav aria-label="Основная навигация">{navigation}</nav>
          <div className="rail-bottom">
            <Link href="/">
              <span className="icon">
                <Globe strokeWidth={1.65} />
              </span>
              Главная
            </Link>
            <ThemeButton />
          </div>
        </aside>
        <main className="center-column">
          <header className="context-header">
            {back && (
              <Link href={back} className="icon-btn" aria-label="Назад">
                <span className="icon">
                  <ArrowLeft strokeWidth={1.65} />
                </span>
              </Link>
            )}
            <span className="crumb">{title}</span>
            <div className="header-tools">
              <ThemeButton compact className="icon-btn lg:hidden!" />
              {viewer ? (
                <>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Уведомления"
                    onClick={() => setNotifications(true)}
                  >
                    <span className="icon">
                      <Bell strokeWidth={1.65} />
                    </span>
                  </button>
                  <Link href="/user" className="my-account-link" aria-label="Мой профиль">
                    <ProfileAvatar name={viewer.name} url={viewer.avatarUrl} size={28} />
                    <span className="account-label">Мой профиль</span>
                  </Link>
                </>
              ) : (
                <div className="guest-account-actions">
                  <Link className="btn secondary small" href="/login">
                    Войти
                  </Link>
                  <Link className="btn primary small" href="/register">
                    Зарегистрироваться
                  </Link>
                </div>
              )}
            </div>
          </header>
          <div className="page-body">{children}</div>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Основная навигация">
        {navigation}
      </nav>
      {notifications && (
        <dialog
          open
          aria-label="Уведомления"
          className="dialog fixed top-1/2 left-1/2 z-[100] -translate-x-1/2 -translate-y-1/2"
        >
          <h2>Уведомления</h2>
          <p>Новых уведомлений нет.</p>
          <button type="button" className="btn secondary" onClick={() => setNotifications(false)}>
            Закрыть
          </button>
        </dialog>
      )}
    </div>
  )
}
