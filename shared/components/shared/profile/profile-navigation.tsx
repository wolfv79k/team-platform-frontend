"use client"

import Link from "next/link"
import ThemeButton from "@/shared/components/shared/layout/theme-button"
import { ProfileIcon } from "./profile-media"

const links = [
  ["/projects", "Проекты", "projects.svg"],
  ["/ideas", "Идеи", "ideas.svg"],
  ["/teams", "Команды", "teams.svg"],
  ["/communities", "Сообщества", "communities.svg"],
  ["/events", "События", "events.svg"],
] as const

function ProfileNavItem({
  href,
  className,
  children,
}: {
  href: string | null
  className: string
  children: React.ReactNode
}) {
  return href ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <span aria-disabled="true" className={className}>
      {children}
    </span>
  )
}

export default function ProfileNavigation() {
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh min-h-[620px] w-60 shrink-0 flex-col px-6 py-7 lg:flex">
        <Link
          href="/user"
          className="flex items-center gap-[11px] text-heading-small leading-[28.5px] font-bold tracking-[-.6px]"
        >
          <span className="grid size-[27px] place-items-center rounded-[7px] bg-account-ink">
            <span className="size-[13px] rounded-xs border border-account-page" />
          </span>
          Название
        </Link>
        <nav
          aria-label="Основная навигация"
          className="mt-[34px] grid gap-2 text-body-large text-account-copy"
        >
          {links.map(([href, label, icon]) => (
            <ProfileNavItem
              href={href}
              key={label}
              className="flex items-center gap-[13px] rounded-lg p-3 hover:bg-account-interaction"
            >
              <ProfileIcon file={icon} size={21} />
              {label}
            </ProfileNavItem>
          ))}
        </nav>
        <div className="mt-auto grid gap-3 px-3 pt-6 pb-10 text-xs text-account-subtle">
          <Link href="/" className="flex items-center gap-2.5">
            <ProfileIcon file="globe.svg" size={15} />
            Главная
          </Link>
          <ThemeButton className="flex cursor-pointer items-center gap-2.5" />
        </div>
      </aside>
      <nav
        aria-label="Основная навигация"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-account-stroke bg-account-page pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {links.map(([href, label, icon]) => (
          <ProfileNavItem
            href={href}
            key={label}
            className="flex flex-col items-center gap-1 py-2.5 text-center text-micro text-account-copy"
          >
            <ProfileIcon file={icon} size={21} />
            {label}
          </ProfileNavItem>
        ))}
      </nav>
    </>
  )
}
