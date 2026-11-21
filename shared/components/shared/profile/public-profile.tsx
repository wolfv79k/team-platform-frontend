"use client"

import "@/app/styles/public-profile.css"

import { useState } from "react"
import Image from "next/image"
import { Box, Briefcase, Calendar, Copy, MapPin, MessageCircle } from "lucide-react"
import type { ProfileView } from "@/services/users.api"
import type { ProfileActivityItem } from "@/shared/lib/profile-activity"
import ProfileLinks from "./profile-links"
import ProfilePortfolio from "./profile-portfolio"
import { Icon } from "@/shared/components/ui/icon"
import { Skills } from "@/shared/components/shared/catalog/catalog-tags"

const tabs = [
  ["portfolio", "Портфолио"],
  ["projects", "Проекты"],
  ["resume", "Резюме"],
  ["posts", "Посты"],
] as const
const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
})

export default function PublicProfile({
  profile,
  posts,
}: {
  profile: ProfileView
  posts: ProfileActivityItem[]
}) {
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("portfolio")
  const [shareStatus, setShareStatus] = useState("")
  const { username, name, bio, avatarUrl, createdAt, city, skills, projects, portfolio } = profile
  const displayName = name || username
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareStatus("Ссылка скопирована.")
    } catch {
      setShareStatus("Не удалось скопировать ссылку.")
    }
  }

  return (
    <article>
      <section className="profile-hero">
        <div className="avatar-edit">
          {avatarUrl && /^https?:\/\//i.test(avatarUrl) ? (
            <Image
              src={avatarUrl}
              alt=""
              width={100}
              height={100}
              className="avatar large"
              unoptimized
            />
          ) : (
            <span className="avatar initials large" aria-hidden="true">
              {initials}
            </span>
          )}
        </div>
        <h1>{displayName}</h1>
        <span className="public-username">@{username}</span>
        {bio && <p className="profile-bio">{bio}</p>}
        <div className="profile-meta">
          {Number.isFinite(Date.parse(createdAt)) && (
            <span>
              <Icon icon={Calendar} />
              На платформе с {dateFormat.format(new Date(createdAt))}
            </span>
          )}
          {city && (
            <span>
              <Icon icon={MapPin} />
              {city}
            </span>
          )}
        </div>
        <div className="profile-skills">
          {skills.map((skill) => (
            <span className="profile-skill" key={skill}>
              {skill}
            </span>
          ))}
        </div>
        <ProfileLinks
          website={profile.website}
          resume={profile.resume}
          socialLinks={profile.socialLinks}
        />
        <div className="public-profile-actions">
          <button type="button" className="btn secondary small" onClick={share}>
            <Icon icon={Copy} />
            Поделиться профилем
          </button>
          {shareStatus && (
            <p role="status" className="mt-2 text-xs">
              {shareStatus}
            </p>
          )}
        </div>
      </section>
      <nav className="profile-tabs" aria-label="Разделы профиля">
        {tabs.map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={value === tab ? "active" : ""}
            aria-pressed={value === tab}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "portfolio" && (
        <section className="work-section">
          <div className="section-heading">
            <div>
              <h2>Личные работы</h2>
              <p>Самостоятельные проекты и учебные работы.</p>
            </div>
            <span className="count">{portfolio.length}</span>
          </div>
          {portfolio.length ? (
            <ProfilePortfolio works={portfolio} />
          ) : (
            <div className="empty-tab">
              <Icon icon={Box} />
              <h2>Портфолио начинается с первой работы</h2>
            </div>
          )}
        </section>
      )}
      {tab === "projects" && (
        <section className="work-section">
          <div className="section-heading">
            <div>
              <h2>Проекты в сервисе</h2>
              <p>Совместная работа, роль и личный вклад.</p>
            </div>
            <span className="count">{projects.length}</span>
          </div>
          {projects.length ? (
            <div className="service-project-list">
              {projects.map((project) => (
                <article key={project.id} className="profile-project-row">
                  <div>
                    <h3>{project.name}</h3>
                    {project.slogan && <p>{project.slogan}</p>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-tab">
              <Icon icon={Box} />
              <h2>Пока нет проектов</h2>
            </div>
          )}
        </section>
      )}
      {tab === "resume" && (
        <section className="empty-tab">
          <Icon icon={Briefcase} />
          <h2>Опыт пока не добавлен</h2>
          <Skills names={skills} />
        </section>
      )}
      {tab === "posts" &&
        (posts.length ? (
          <section className="work-section profile-posts">
            {posts.map((post) => (
              <article className="post-card" key={post.id}>
                <h2>{post.title}</h2>
                {post.detail && <p>{post.detail}</p>}
              </article>
            ))}
          </section>
        ) : (
          <div className="empty-tab">
            <Icon icon={MessageCircle} />
            <h2>Пока нет постов</h2>
          </div>
        ))}
    </article>
  )
}
