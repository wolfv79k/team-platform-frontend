"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Input } from "@/shared/components/ui/input"
import ThemeButton from "@/shared/components/shared/layout/theme-button"
import { Button } from "@/shared/components/ui/button"
import {
  OWN_PROFILE_PATH,
  PROFILE_RESUME_PATH,
  PROFILE_SETTINGS_PATH,
} from "@/shared/lib/profile-routes"
import { useProfileSidebarStore } from "@/shared/store/profile-sidebar.store"
import { ProfileAvatar, ProfileIcon } from "./profile-media"

export default function ProfileSidebar({
  username,
  name,
  avatarUrl,
  resume,
}: {
  username: string
  name: string
  avatarUrl: string | null
  resume: boolean
}) {
  const pathname = usePathname()
  const { isOpen, setIsOpen } = useProfileSidebarStore()
  const links = [
    [OWN_PROFILE_PATH, username, "user.svg"],
    [PROFILE_SETTINGS_PATH, "Настройки", "settings.svg"],
    [PROFILE_RESUME_PATH, "Опыт работы", "briefcase.svg"],
  ]

  return (
    <>
      {isOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          type="button"
          aria-label="Закрыть меню профиля"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        id="profile-sidebar"
        aria-label="Меню профиля"
        className={`${isOpen ? "fixed inset-y-0 left-0 z-50 flex" : "hidden"} w-[320px] max-w-[85vw] shrink-0 flex-col gap-5 overflow-y-auto bg-account-page px-4 py-[18px] lg:sticky lg:top-0 lg:flex lg:h-dvh lg:min-h-[620px] lg:max-w-none`}
      >
        <form action="/projects" className="hidden items-center gap-[7px] lg:flex">
          <label className="flex h-[38px] min-w-0 flex-1 items-center gap-[9px] rounded-lg border border-account-stroke bg-account-panel px-[11px]">
            <ProfileIcon file="search.svg" size={16} />
            <input
              name="q"
              type="search"
              aria-label="Поиск проектов"
              placeholder="Поиск"
              className="w-full bg-transparent text-compact outline-none"
            />
          </label>
          <button
            type="button"
            aria-label="Уведомления"
            className="grid h-9 w-7 place-items-center"
          >
            <ProfileIcon file="bell.svg" size={20} />
          </button>
          <Link href={OWN_PROFILE_PATH} aria-label="Мой профиль" className="text-micro">
            <ProfileAvatar name={name} url={avatarUrl} size={30} />
          </Link>
        </form>
        <ThemeButton className="flex items-center gap-2 text-xs lg:hidden" />
        <nav aria-label="Настройки аккаунта" className="grid gap-[5px]">
          {links.map(([href, label, icon], index) => {
            const active = index === (pathname === PROFILE_SETTINGS_PATH ? 1 : resume ? 2 : 0)
            return (
              <Link
                href={href}
                key={href}
                onClick={() => setIsOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[42px] items-center gap-3 rounded-lg px-3 text-compact ${active ? "bg-account-selected text-account-link" : "text-account-copy hover:bg-account-interaction"}`}
              >
                <ProfileIcon file={icon} size={18} />
                <span className="truncate">{label}</span>
              </Link>
            )
          })}
        </nav>
        <section className="rounded-xl border border-account-stroke bg-account-panel px-[15px] py-[17px]">
          <h2 className="flex items-center gap-[9px] text-xs font-semibold">
            <Image
              src="/icons/profile/headhunter.png"
              alt=""
              width={20}
              height={20}
              className="rounded-full"
            />
            Импорт резюме с HH.ru
          </h2>
          <label
            htmlFor="profile-resume-import"
            className="mt-[19px] mb-[7px] block text-caption text-account-subtle"
          >
            Ссылка на резюме
          </label>
          <Input
            id="profile-resume-import"
            type="url"
            placeholder="https://hh.ru/resume/..."
            disabled
            className="h-[34px] rounded-lg text-caption"
          />
          <p className="pt-2 pb-3 text-caption text-account-subtle">Импорт пока недоступен</p>
          <Button
            disabled
            className="h-[34px] bg-account-unavailable text-xs text-account-subtle disabled:opacity-85"
          >
            Автозаполнение
          </Button>
        </section>
      </aside>
    </>
  )
}
