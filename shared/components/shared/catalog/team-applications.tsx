"use client"

import "@/app/styles/catalog-details.css"
import Link from "next/link"
import { useState, type FormEvent } from "react"
import { BrowseLayout } from "@/shared/components/shared/layout/browse-layout"
import { ProfileAvatar } from "@/shared/components/shared/profile/profile-media"
import { applicationStatusLabels, applicationTypeLabels } from "@/shared/lib/project-display"
import { ApplicationStatus, ApplicationType } from "@/types/enums"
import type { TeamApplication } from "@/types/models"
import { Tag } from "./catalog-tags"
import {
  applicationRights,
  TeamPreviewNotice,
  useTeamPreview,
  type TeamView,
} from "./team-preview-provider"

export function TeamApplicationRows({
  items,
  showTeam = false,
}: {
  items: TeamApplication[]
  showTeam?: boolean
}) {
  const preview = useTeamPreview()
  const [error, setError] = useState("")
  function decide(id: number, action: "accept" | "decline" | "withdraw") {
    if (action === "withdraw" && !window.confirm("Отозвать заявку или приглашение?")) return
    try {
      preview.decide(id, action)
      setError("")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось изменить заявку.")
    }
  }
  if (!items.length) return <p className="reading">Заявок и приглашений пока нет.</p>
  return (
    <div className="project-application-list">
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {items.map((item) => {
        const team = preview.teams.find((team) => team.id === item.teamId)
        if (!team) return null
        const user = preview.users.find((user) => user.id === item.userId)
        const rights = applicationRights(item, team.captainId, preview.viewerId)
        const pending = item.status === ApplicationStatus.PENDING
        return (
          <article key={item.id} className="project-application">
            <div className="member-row">
              <ProfileAvatar name={user?.name ?? "Пользователь"} size={36} />
              <div>
                <strong>{user?.name}</strong>
                <small>
                  {applicationTypeLabels[item.type]} · @{user?.username}
                </small>
              </div>
              <Tag
                tone={pending ? "blue" : item.status === ApplicationStatus.ACCEPTED ? "green" : ""}
              >
                {applicationStatusLabels[item.status]}
              </Tag>
            </div>
            {showTeam && (
              <p className="reading">
                <Link href={`/teams/${team.id}`} className="project-inline-link">
                  {team.name}
                </Link>
              </p>
            )}
            {item.message && <p className="reading whitespace-pre-wrap">{item.message}</p>}
            <small>
              {new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Moscow" }).format(
                new Date(item.createdAt),
              )}
            </small>
            {(rights.canDecide || rights.canWithdraw) && (
              <div className="project-action-row">
                {rights.canDecide && (
                  <>
                    <button className="btn primary small" onClick={() => decide(item.id, "accept")}>
                      Принять
                    </button>
                    <button
                      className="btn secondary small"
                      onClick={() => decide(item.id, "decline")}
                    >
                      Отклонить
                    </button>
                  </>
                )}
                {rights.canWithdraw && (
                  <button
                    className="btn secondary small"
                    onClick={() => decide(item.id, "withdraw")}
                  >
                    Отозвать
                  </button>
                )}
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}

export function TeamApplicationPanel({ team }: { team: TeamView }) {
  const preview = useTeamPreview()
  const captain = team.captainId === preview.viewerId
  const member = team.teamMembers.some((item) => item.userId === preview.viewerId)
  const items = preview.applications.filter(
    (item) => item.teamId === team.id && (captain || item.userId === preview.viewerId),
  )
  const pending = items.some((item) => item.status === ApplicationStatus.PENDING)
  const available = preview.users.filter(
    (user) =>
      !team.teamMembers.some((item) => item.userId === user.id) &&
      !items.some((item) => item.userId === user.id && item.status === ApplicationStatus.PENDING),
  )
  const canSend = captain ? available.length > 0 : !member && !pending
  const [message, setMessage] = useState("")
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)
  const [status, setStatus] = useState<ApplicationStatus | "">("")

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      preview.send(
        team.id,
        captain ? ApplicationType.INVITATION : ApplicationType.REQUEST,
        message,
        captain ? username : undefined,
      )
      setMessage("")
      setUsername("")
      setError("")
      setSent(true)
    } catch (error) {
      setSent(false)
      setError(error instanceof Error ? error.message : "Не удалось создать заявку.")
    }
  }

  return (
    <section className="entity-section">
      <h2>{captain ? "Заявки и приглашения команды" : "Мои заявки и приглашения"}</h2>
      {canSend && (
        <form className="project-inline-form" onSubmit={submit}>
          <h3>{captain ? "Пригласить участника" : "Подать заявку"}</h3>
          {captain && (
            <div className="field">
              <label htmlFor="team-invite-username">Имя пользователя</label>
              <select
                id="team-invite-username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              >
                <option value="">Выбери участника</option>
                {available.map((user) => (
                  <option key={user.id} value={user.username}>
                    {user.name} (@{user.username})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="field">
            <label htmlFor="team-application-message">Сообщение</label>
            <textarea
              id="team-application-message"
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={
                captain
                  ? "Расскажи, над чем работает команда"
                  : "Расскажи о себе и почему хочешь вступить"
              }
            />
          </div>
          <button className="btn primary" type="submit">
            {captain ? "Отправить приглашение в демо" : "Отправить заявку в демо"}
          </button>
        </form>
      )}
      {captain && !canSend && (
        <p className="reading">Все доступные демо-пользователи уже участвуют или ожидают ответа.</p>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {sent && (
        <p className="reading" role="status">
          {captain ? "Приглашение создано в демо." : "Заявка создана в демо."}
        </p>
      )}
      <div className="field mt-4">
        <label htmlFor="team-application-status">Статус</label>
        <select
          id="team-application-status"
          value={status}
          onChange={(event) => setStatus(event.target.value as ApplicationStatus | "")}
        >
          <option value="">Все статусы</option>
          {Object.values(ApplicationStatus).map((value) => (
            <option key={value} value={value}>
              {applicationStatusLabels[value]}
            </option>
          ))}
        </select>
      </div>
      <TeamApplicationRows items={items.filter((item) => !status || item.status === status)} />
    </section>
  )
}

export default function TeamApplications() {
  const preview = useTeamPreview()
  const [status, setStatus] = useState<ApplicationStatus | "">("")
  const [type, setType] = useState<ApplicationType | "">("")
  const items = preview.applications.filter((item) => {
    const team = preview.teams.find((team) => team.id === item.teamId)
    return (
      (team?.captainId === preview.viewerId || item.userId === preview.viewerId) &&
      (!status || item.status === status) &&
      (!type || item.type === type)
    )
  })
  return (
    <BrowseLayout title="Заявки и приглашения" back="/teams">
      <section className="project-detail">
        <h1 className="text-2xl font-semibold">Мои заявки и приглашения в команды</h1>
        <div className="my-4">
          <TeamPreviewNotice />
        </div>
        <div className="form-grid mb-4">
          <div className="field">
            <label htmlFor="team-list-status">Статус</label>
            <select
              id="team-list-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as ApplicationStatus | "")}
            >
              <option value="">Все</option>
              {Object.values(ApplicationStatus).map((value) => (
                <option key={value} value={value}>
                  {applicationStatusLabels[value]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="team-list-type">Тип</label>
            <select
              id="team-list-type"
              value={type}
              onChange={(event) => setType(event.target.value as ApplicationType | "")}
            >
              <option value="">Все</option>
              {Object.values(ApplicationType).map((value) => (
                <option key={value} value={value}>
                  {applicationTypeLabels[value]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <TeamApplicationRows key={preview.viewerId} items={items} showTeam />
      </section>
    </BrowseLayout>
  )
}
