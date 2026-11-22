"use client"

import "@/app/styles/personal-profile.css"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import type { ProfileView } from "@/services/users.api"
import { Button } from "@/shared/components/ui/button"
import {
  ADD_PROJECT_PATH,
  OWN_PROFILE_PATH,
  PROFILE_RESUME_PATH,
  PROFILE_SETTINGS_PATH,
  publicProfilePath,
} from "@/shared/lib/profile-routes"
import { useProfileSidebarStore } from "@/shared/store/profile-sidebar.store"
import ProfileLinks from "./profile-links"
import ProfilePortfolio from "./profile-portfolio"
import ProfileSidebar from "./profile-sidebar"
import { ProfileAvatar, ProfileIcon } from "./profile-media"
import { levelLabels } from "@/shared/lib/project-display"
import type { SkillLevel } from "@/types/enums"

const tabs = [
  { key: "portfolio", label: "Портфолио", href: OWN_PROFILE_PATH },
  { key: "projects", label: "Проекты", href: `${OWN_PROFILE_PATH}?tab=projects` },
  { key: "resume", label: "Резюме", href: PROFILE_RESUME_PATH },
  { key: "posts", label: "Посты", href: `${OWN_PROFILE_PATH}?tab=posts` },
] as const

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
})
const actionClass =
  "flex items-center justify-center gap-[9px] rounded-lg border border-account-stroke bg-account-panel font-medium hover:bg-account-interaction"

function SkillBadge({ skill, level }: { skill: string; level?: SkillLevel }) {
  const label = skill.toLowerCase()

  return (
    <li className="flex items-center gap-1.5 rounded-md border border-account-stroke bg-account-panel px-[9px] py-1 text-caption leading-4 text-account-copy">
      {(label === "react" || label === "reactjs") && <ProfileIcon file="react.svg" size={13} />}
      {label === "typescript" && (
        <span
          aria-hidden="true"
          className="rounded-xs bg-typescript p-0.5 text-fine-print leading-[10px] font-bold text-white"
        >
          TS
        </span>
      )}
      {label === "figma" && <ProfileIcon file="figma.png" size={14} />}
      {skill}
      {level && <span className="text-account-subtle">· {levelLabels[level]}</span>}
    </li>
  )
}

export default function PersonalProfile({ profile }: { profile: ProfileView }) {
  const { username, name, avatarUrl, createdAt, bio, city, projects, skills } = profile
  const displayName = name || username
  const joined = Date.parse(createdAt)
  const pathname = usePathname()
  const tab = useSearchParams().get("tab")
  const activeTab = tabs.find(({ key }) => key === tab)?.key ?? "portfolio"
  const { isOpen, setIsOpen } = useProfileSidebarStore()

  return (
    <>
      <article className="personal-profile min-w-0 flex-1 border-x border-account-stroke pb-20 lg:pb-[34px]">
        <header className="personal-profile-header flex h-[72px] items-center justify-between gap-3 border-b border-account-stroke px-4 sm:px-8">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Открыть меню профиля"
            aria-controls="profile-sidebar"
            aria-expanded={isOpen}
            className="flex min-w-0 cursor-pointer items-center gap-2.5 text-body font-medium lg:hidden"
          >
            <span className="text-micro">
              <ProfileAvatar name={displayName} url={avatarUrl} size={30} />
            </span>
            <span className="truncate">{username}</span>
            <ProfileIcon file="chevron.svg" size={13} />
          </button>
          <div className="hidden min-w-0 items-center gap-2.5 text-body font-medium lg:flex">
            <span className="text-micro">
              <ProfileAvatar name={displayName} url={avatarUrl} size={30} />
            </span>
            <span className="truncate">{username}</span>
            <ProfileIcon file="chevron.svg" size={13} />
          </div>
          <Link
            href={PROFILE_SETTINGS_PATH}
            className={`${actionClass} min-h-8 shrink-0 px-[11px] py-[5px] text-compact`}
          >
            <ProfileIcon file="edit.svg" size={16} />
            Редактирование
          </Link>
        </header>

        <section className="personal-profile-hero flex flex-col items-center px-5 pt-9 text-center sm:px-10">
          {!publicProfilePath(username) && (
            <p className="mb-6 rounded-lg border border-account-stroke p-3 text-sm">
              Выберите другой ник в настройках, чтобы у профиля появился публичный адрес.
            </p>
          )}
          <div className="relative text-heading-large">
            <ProfileAvatar name={displayName} url={avatarUrl} size={100} />
            <Link
              href={`${PROFILE_SETTINGS_PATH}#profile-avatar`}
              aria-label="Изменить аватар"
              className={`${actionClass} absolute top-[72px] left-[75px] size-[27px] rounded-full`}
            >
              <ProfileIcon file="edit-avatar.svg" size={13} />
            </Link>
          </div>
          <h1 className="mt-4 text-heading leading-[1.3] font-semibold tracking-[-.7px] [overflow-wrap:anywhere]">
            {displayName}
          </h1>
          {bio && (
            <p className="mt-2.5 max-w-[500px] text-body leading-[1.7] whitespace-pre-wrap text-account-copy [overflow-wrap:anywhere]">
              {bio}
            </p>
          )}
          {(Number.isFinite(joined) || city) && (
            <div className="mt-[17px] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs leading-[18px] text-account-subtle">
              {Number.isFinite(joined) && (
                <p className="flex items-center gap-1.5">
                  <ProfileIcon file="calendar.svg" size={14} />
                  <span>
                    На платформе с <time dateTime={createdAt}>{dateFormat.format(joined)}</time>
                  </span>
                </p>
              )}
              {city && (
                <p className="flex items-center gap-1.5">
                  <ProfileIcon file="map-pin.svg" size={14} />
                  {city}
                </p>
              )}
            </div>
          )}
          <ul
            aria-label="Навыки"
            className="mt-5 flex flex-wrap items-center justify-center gap-[7px]"
          >
            {skills.map((skill) => (
              <SkillBadge key={skill} skill={skill} />
            ))}
            <li>
              <Link
                href={PROFILE_SETTINGS_PATH}
                aria-label="Добавить навык"
                className="grid size-7 place-items-center rounded-md border border-dashed border-account-stroke-light hover:bg-account-interaction"
              >
                <ProfileIcon file="add-skill.svg" size={14} />
              </Link>
            </li>
          </ul>
          <ProfileLinks
            website={profile.website}
            resume={profile.resume}
            socialLinks={profile.socialLinks}
          />
        </section>

        <nav
          aria-label="Разделы профиля"
          className="personal-profile-tabs mx-4 mt-7 flex justify-center gap-3 border-b border-account-stroke sm:mx-8 sm:gap-7"
        >
          {tabs.map(({ key, label, href }) => (
            <button
              type="button"
              key={key}
              onClick={() =>
                window.history.replaceState(
                  null,
                  "",
                  pathname + (href.includes("?") ? href.slice(href.indexOf("?")) : ""),
                )
              }
              aria-current={activeTab === key ? "page" : undefined}
              className={`min-h-[49px] cursor-pointer border-b-2 px-0.5 text-caption font-semibold tracking-[.4px] uppercase ${activeTab === key ? "border-current" : "border-transparent text-account-subtle"}`}
            >
              {label}
            </button>
          ))}
        </nav>

        <section className="px-4 pt-[26px] sm:px-8">
          {activeTab === "portfolio" && (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-section leading-[1.3] font-semibold tracking-[-.3px]">
                    Личные работы
                  </h2>
                  <p className="mt-1.5 text-compact text-account-copy">
                    Личные проекты и кейсы, которые ты хочешь показать.
                  </p>
                </div>
                <span className="min-w-[23px] rounded-[5px] border border-account-stroke px-[5px] text-center text-micro text-account-subtle">
                  {profile.portfolio.length}
                </span>
              </div>
              <div className="mt-[19px] grid gap-3.5 sm:grid-cols-2">
                <Link href={ADD_PROJECT_PATH} className={`${actionClass} h-11 text-compact`}>
                  <ProfileIcon file="portfolio.svg" size={16} />
                  Добавить работу
                  <ProfileIcon file="plus.svg" size={16} />
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  className={`${actionClass} h-11 text-compact leading-normal`}
                >
                  <Image
                    src="/icons/profile/github.png"
                    width={18}
                    height={18}
                    alt=""
                    className="size-[18px]!"
                  />
                  GitHub
                  <ProfileIcon file="plus.svg" size={16} />
                </Button>
              </div>
              {profile.portfolio.length > 0 ? (
                <ProfilePortfolio works={profile.portfolio} />
              ) : (
                <div className="mt-[23px] rounded-xl border border-account-stroke px-5 py-9 text-center">
                  <div className="mx-auto mb-3 grid size-9 place-items-center rounded-lg bg-account-interaction">
                    <ProfileIcon file="portfolio.svg" size={16} />
                  </div>
                  <h3 className="text-body-large font-semibold">
                    Портфолио начинается с первой работы
                  </h3>
                  <p className="mt-1 text-xs text-account-copy">
                    Добавь личный проект, учебную работу или готовый кейс.
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === "projects" && (
            <>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-section font-semibold">Проекты</h2>
                <Link href="/projects/new" className={`${actionClass} min-h-8 px-3 py-1.5 text-compact`}>
                  <ProfileIcon file="plus.svg" size={14} />Создать проект
                </Link>
              </div>
              {projects.length > 0 ? (
                <ul className="mt-4 grid gap-[18px] sm:grid-cols-2">
                  {projects.map((project) => (
                    <li
                      key={project.id}
                      className="rounded-xl border border-account-stroke bg-account-panel p-4"
                    >
                      <h3 className="text-body-large font-semibold [overflow-wrap:anywhere]">
                        <Link href={`/projects/${project.id}`} className="hover:text-account-link">{project.name}</Link>
                      </h3>
                      {project.slogan && (
                        <p className="mt-2 text-xs text-account-copy [overflow-wrap:anywhere]">
                          {project.slogan}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-account-subtle">Пока нет проектов.</p>
              )}
            </>
          )}

          {activeTab === "resume" && (
            <>
              <h2 className="text-section font-semibold">Резюме</h2>
              {skills.length ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {profile.skillDetails.map(({ name, level }) => (
                    <SkillBadge key={name} skill={name} level={level} />
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-account-subtle">
                  Здесь будет информация о твоём опыте и навыках.
                </p>
              )}
            </>
          )}

          {activeTab === "posts" && (
            <>
              <h2 className="text-section font-semibold">Посты</h2>
              <p className="mt-2 text-sm text-account-subtle">
                Здесь будут публикации пользователя.
              </p>
            </>
          )}
        </section>
      </article>
      <ProfileSidebar
        username={username}
        name={displayName}
        avatarUrl={avatarUrl}
        resume={activeTab === "resume"}
      />
    </>
  )
}
