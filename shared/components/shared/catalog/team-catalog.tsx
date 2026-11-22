"use client"

import "@/app/styles/catalog.css"
import Link from "next/link"
import { useState } from "react"
import { Plus, Search, Users } from "lucide-react"
import { BrowseLayout } from "@/shared/components/shared/layout/browse-layout"
import { ProfileAvatar } from "@/shared/components/shared/profile/profile-media"
import { Icon } from "@/shared/components/ui/icon"
import { plural } from "@/shared/lib/catalog-preview"
import { Skills, Tag } from "./catalog-tags"
import { TeamPreviewNotice, useTeamPreview, type TeamView } from "./team-preview-provider"

function TeamCard({ team }: { team: TeamView }) {
  const { users, viewerId } = useTeamPreview()
  const captain = users.find((user) => user.id === team.captainId)
  const member = team.teamMembers.some((item) => item.userId === viewerId)
  return (
    <article className="team-entry">
      <div className="catalog-cover is-fallback" aria-hidden="true">
        <Users size={30} />
      </div>
      <div className="team-entry-body">
        <div className="catalog-title-line">
          <h2 className="catalog-entry-title">
            <Link href={`/teams/${team.id}`}>{team.name}</Link>
          </h2>
          {member && <Tag tone="blue">{team.captainId === viewerId ? "Капитан" : "Участник"}</Tag>}
        </div>
        <p className="catalog-excerpt">{team.description || "Описание пока не добавлено"}</p>
        <Skills names={team.teamSkills.map(({ skill }) => skill.name)} />
      </div>
      <div className="team-roster">
        <div className="team-roster-count">
          <span className="people-stack">
            {team.teamMembers.slice(0, 3).map(({ userId }) => (
              <ProfileAvatar
                key={userId}
                name={users.find((user) => user.id === userId)?.name ?? "Участник"}
                size={25}
              />
            ))}
          </span>
          <span>{plural(team.teamMembers.length, "участник", "участника", "участников")}</span>
        </div>
        <p>
          Капитан <strong className="block font-medium">{captain?.name ?? "Пользователь"}</strong>
        </p>
      </div>
    </article>
  )
}

export default function TeamCatalog() {
  const { teams, viewerId } = useTeamPreview()
  const [search, setSearch] = useState("")
  const [skill, setSkill] = useState("")
  const [mine, setMine] = useState(false)
  const technologies = [
    ...new Set(teams.flatMap((team) => team.teamSkills.map(({ skill }) => skill.name))),
  ].sort()
  const filtered = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(search.trim().toLowerCase()) &&
      (!mine || team.teamMembers.some((member) => member.userId === viewerId)) &&
      (!skill || team.teamSkills.some((item) => item.skill.name === skill)),
  )
  return (
    <BrowseLayout title="Команды">
      <section className="catalog-head">
        <h1>Команды</h1>
        <p>Найди людей для совместной работы и участия в хакатонах.</p>
        <div className="mt-4">
          <TeamPreviewNotice />
        </div>
        <div className="catalog-actions flex-wrap">
          <label className="searchbox">
            <Icon icon={Search} />
            <input
              aria-label="Поиск по командам"
              type="search"
              placeholder="Поиск по названию"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <Link className="btn primary" href="/teams/new">
            <Icon icon={Plus} /> Создать команду
          </Link>
          <Link className="btn secondary" href="/teams/applications">
            Заявки и приглашения
          </Link>
        </div>
        <div className="catalog-actions flex-wrap mt-3">
          <div className="select-wrap">
            <select
              aria-label="Технология"
              value={skill}
              onChange={(event) => setSkill(event.target.value)}
            >
              <option value="">Все технологии</option>
              {technologies.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="catalog-filters" aria-label="Фильтры команд">
          <button
            type="button"
            className={`filter${!mine ? " active" : ""}`}
            aria-pressed={!mine}
            onClick={() => setMine(false)}
          >
            Все команды
          </button>
          <button
            type="button"
            className={`filter${mine ? " active" : ""}`}
            aria-pressed={mine}
            onClick={() => setMine(true)}
          >
            Мои команды
          </button>
        </div>
      </section>
      <section className="catalog-list" aria-label="Команды" aria-live="polite">
        {filtered.length ? (
          <div className="team-index">
            {filtered.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div className="empty-tab">
            <Icon icon={Search} />
            <h2>Команды не найдены</h2>
            <button
              className="btn secondary"
              onClick={() => {
                setSearch("")
                setSkill("")
                setMine(false)
              }}
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </section>
    </BrowseLayout>
  )
}
