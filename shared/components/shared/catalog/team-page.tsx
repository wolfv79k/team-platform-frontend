"use client"

import "@/app/styles/catalog-details.css"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Users } from "lucide-react"
import { BrowseLayout } from "@/shared/components/shared/layout/browse-layout"
import { ProfileAvatar } from "@/shared/components/shared/profile/profile-media"
import { catalogPreview } from "@/shared/data/catalog-preview"
import { plural } from "@/shared/lib/catalog-preview"
import { levelLabels } from "@/shared/lib/project-display"
import { Tag } from "./catalog-tags"
import { TeamApplicationPanel } from "./team-applications"
import { TeamPreviewNotice, useTeamPreview, type TeamView } from "./team-preview-provider"
import type { TeamMember } from "@/types/models"
import { ApplicationStatus } from "@/types/enums"

function Member({
  member,
  captainId,
  manage,
}: {
  member: TeamMember
  captainId: number
  manage?: boolean
}) {
  const preview = useTeamPreview()
  const user = preview.users.find((item) => item.id === member.userId)
  return (
    <article className="project-member-item">
      <div className="member-row">
        <ProfileAvatar name={user?.name ?? "Участник"} size={40} />
        <div>
          <strong>{user?.name}</strong>
          <small>@{user?.username}</small>
        </div>
        {member.userId === captainId && <Tag tone="blue">Капитан</Tag>}
      </div>
      {member.contribution && <p className="reading whitespace-pre-wrap">{member.contribution}</p>}
      {manage && member.userId !== captainId && (
        <button
          className="btn secondary small"
          onClick={() => {
            if (window.confirm(`Исключить ${user?.name ?? "участника"} из демо-команды?`))
              preview.removeMember(member.teamId, member.userId)
          }}
        >
          Исключить
        </button>
      )}
    </article>
  )
}

function Contribution({ member }: { member: TeamMember }) {
  const { contribution } = useTeamPreview()
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState("")
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      contribution(
        member.teamId,
        String(new FormData(event.currentTarget).get("contribution") ?? ""),
      )
      setEditing(false)
      setError("")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось обновить вклад.")
    }
  }
  return (
    <section className="contribution">
      <div className="flex-between">
        <h3>Мой вклад в команду</h3>
        {!editing && (
          <button className="btn secondary small" onClick={() => setEditing(true)}>
            Изменить
          </button>
        )}
      </div>
      {editing ? (
        <form className="project-inline-form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="team-contribution">Опиши свой вклад</label>
            <textarea
              id="team-contribution"
              name="contribution"
              rows={4}
              defaultValue={member.contribution ?? ""}
            />
          </div>
          <div className="project-action-row">
            <button type="submit" className="btn primary small">
              Сохранить в демо
            </button>
            <button type="button" className="btn secondary small" onClick={() => setEditing(false)}>
              Отмена
            </button>
          </div>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
        </form>
      ) : (
        <p className="whitespace-pre-wrap">
          {member.contribution || "Ты ещё не описал свой вклад."}
        </p>
      )}
    </section>
  )
}

function TeamDetails({ team }: { team: TeamView }) {
  const router = useRouter()
  const preview = useTeamPreview()
  const [tab, setTab] = useState("about")
  const captain = team.captainId === preview.viewerId
  const member = team.teamMembers.find((item) => item.userId === preview.viewerId)
  const applications = preview.applications.filter(
    (item) => item.teamId === team.id && (captain || item.userId === preview.viewerId),
  )
  const pending = applications.filter((item) => item.status === ApplicationStatus.PENDING).length
  const captainUser = preview.users.find((item) => item.id === team.captainId)
  const events = catalogPreview.events.filter((event) =>
    team.hackathonTeams.some((item) => item.hackathonId === event.id),
  )
  const tabs = [
    { id: "about", title: "О команде" },
    { id: "members", title: `Участники (${team.teamMembers.length})` },
    { id: "events", title: "События" },
    { id: "applications", title: `Заявки и приглашения${pending ? ` (${pending})` : ""}` },
  ]
  return (
    <>
      <div className="entity-heading">
        <div className="entity-mark" aria-hidden="true">
          <Users size={28} />
        </div>
        <div className="flex-1">
          <h1>{team.name}</h1>
          <p>
            {plural(team.teamMembers.length, "участник", "участника", "участников")} · Капитан{" "}
            {captainUser?.name}
          </p>
        </div>
        <div className="entity-actions">
          {captain ? (
            <>
              <Link className="btn secondary" href={`/teams/${team.id}/edit`}>
                Редактировать
              </Link>
              <button className="btn primary" onClick={() => setTab("applications")}>
                Пригласить
              </button>
            </>
          ) : member ? (
            <Tag tone="blue">Ты в команде</Tag>
          ) : (
            <button className="btn primary" onClick={() => setTab("applications")}>
              {pending ? "Моя заявка / приглашение" : "Подать заявку"}
            </button>
          )}
        </div>
      </div>
      <nav className="detail-tabs" aria-label="Разделы команды">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? "active" : ""}
            aria-pressed={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            {item.title}
          </button>
        ))}
      </nav>
      {tab === "about" && (
        <>
          <section className="entity-section">
            <h2>Описание</h2>
            <p className="reading whitespace-pre-wrap">
              {team.description || "Описание пока не добавлено."}
            </p>
          </section>
          <section className="entity-section">
            <h2>Технологии команды</h2>
            {team.teamSkills.length ? (
              <div className="skill-level-list">
                {team.teamSkills.map(({ skill, skillLevel }) => (
                  <span key={skill.id}>
                    <Tag>{skill.name}</Tag>
                    <small>{levelLabels[skillLevel]}</small>
                  </span>
                ))}
              </div>
            ) : (
              <p className="reading">Технологии пока не указаны.</p>
            )}
          </section>
          <section className="entity-section">
            <h2>Капитан команды</h2>
            <div className="member-row">
              <ProfileAvatar name={captainUser?.name ?? "Капитан"} size={40} />
              <div>
                <strong>{captainUser?.name}</strong>
                <small>@{captainUser?.username}</small>
              </div>
              <Tag tone="blue">Капитан</Tag>
            </div>
          </section>
          {member && <Contribution member={member} />}
          {captain && (
            <div className="project-action-row mt-6">
              <button
                className="btn quiet small"
                onClick={() => {
                  if (window.confirm(`Удалить демо-команду «${team.name}»?`)) {
                    preview.remove(team.id)
                    router.push("/teams")
                  }
                }}
              >
                Удалить команду
              </button>
            </div>
          )}
        </>
      )}
      {tab === "members" && (
        <section className="entity-section">
          <h2>Участники</h2>
          {team.teamMembers.map((item) => (
            <Member key={item.userId} member={item} captainId={team.captainId} manage={captain} />
          ))}
          {member && !captain && (
            <button
              className="btn secondary mt-4"
              onClick={() => {
                if (window.confirm("Покинуть демо-команду?")) {
                  preview.removeMember(team.id, preview.viewerId)
                  setTab("about")
                }
              }}
            >
              Покинуть команду
            </button>
          )}
        </section>
      )}
      {tab === "events" && (
        <section className="entity-section">
          <h2>Участие в событиях</h2>
          {events.length ? (
            events.map((event) => (
              <p key={event.id} className="reading">
                <Link className="project-inline-link" href={`/events/${event.id}`}>
                  {event.name}
                </Link>
              </p>
            ))
          ) : (
            <p className="reading">Команда пока не участвует в событиях.</p>
          )}
        </section>
      )}
      {tab === "applications" && <TeamApplicationPanel team={team} />}
    </>
  )
}

export default function TeamPage({ id }: { id: number }) {
  const { teams, viewerId } = useTeamPreview()
  const team = teams.find((item) => item.id === id)
  return (
    <BrowseLayout title={team ? `Команды › ${team.name}` : "Команды"} back="/teams">
      <article className="entity-detail">
        <div className="mb-5">
          <TeamPreviewNotice />
        </div>
        {team ? (
          <TeamDetails key={`${id}-${viewerId}`} team={team} />
        ) : (
          <div className="empty-tab">
            <h2>Команда не найдена</h2>
            <Link className="btn secondary" href="/teams">
              К списку команд
            </Link>
          </div>
        )}
      </article>
    </BrowseLayout>
  )
}
