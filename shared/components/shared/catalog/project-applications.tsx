"use client"

import "@/app/styles/forms.css"
import "@/app/styles/catalog-details.css"
import Link from "next/link"
import { useState, type FormEvent } from "react"
import { applicationsApi, type ApplicationFilters } from "@/services/applications.api"
import { dictionariesApi } from "@/services/dictionaries.api"
import { apiErrorMessage } from "@/services/api-error"
import { useViewer } from "@/shared/components/shared/layout/viewer-provider"
import { BrowseLayout } from "@/shared/components/shared/layout/browse-layout"
import { ProfileAvatar } from "@/shared/components/shared/profile/profile-media"
import {
  applicationTypeLabels,
  applicationStatusLabels,
  loginUrl,
} from "@/shared/lib/project-display"
import {
  useMyApplications,
  useProjectApplications,
  useProjectMutation,
} from "@/shared/lib/project-queries"
import { ApplicationStatus, ApplicationType, ProjectStatus } from "@/types/enums"
import type { ProjectApplicationView, ProjectDetail } from "@/types/api"
import { Tag } from "./catalog-tags"

type Decision = "accept" | "decline" | "withdraw"

export function ApplicationRows({
  items,
  viewerId,
  showProject = false,
}: {
  items: ProjectApplicationView[]
  viewerId: number
  showProject?: boolean
}) {
  const mutation = useProjectMutation(async ({ id, action }: { id: number; action: Decision }) => {
    await applicationsApi[action](id)
  })
  if (!items.length) return <p className="reading">Заявок и приглашений пока нет.</p>
  return (
    <div className="project-application-list">
      {mutation.isError && (
        <p className="field-error" role="alert">
          {apiErrorMessage(mutation.error)}
        </p>
      )}
      {items.map((item) => {
        const pending = item.status === ApplicationStatus.PENDING
        const canDecide =
          pending &&
          (item.type === ApplicationType.REQUEST
            ? item.project.authorId === viewerId
            : item.userId === viewerId)
        const canWithdraw =
          pending &&
          (item.type === ApplicationType.REQUEST
            ? item.userId === viewerId
            : item.project.authorId === viewerId)
        const name = item.user.name || item.user.username
        return (
          <article className="project-application" key={item.id}>
            <div className="member-row">
              <ProfileAvatar name={name} url={item.user.avatarUrl} size={36} />
              <div>
                <Link href={`/${encodeURIComponent(item.user.username)}`}>
                  <strong>{name}</strong>
                </Link>
                <small>
                  {applicationTypeLabels[item.type]} · {item.role.name}
                </small>
              </div>
              <Tag
                tone={pending ? "blue" : item.status === ApplicationStatus.ACCEPTED ? "green" : ""}
              >
                {applicationStatusLabels[item.status]}
              </Tag>
            </div>
            {showProject && (
              <p className="reading">
                <Link href={`/projects/${item.projectId}`} className="project-inline-link">
                  {item.project.name}
                </Link>
              </p>
            )}
            {item.message && <p className="reading whitespace-pre-wrap">{item.message}</p>}
            <small>{new Date(item.createdAt).toLocaleDateString("ru-RU")}</small>
            {(canDecide || canWithdraw) && (
              <div className="project-action-row">
                {canDecide && (
                  <>
                    <button
                      className="btn primary small"
                      disabled={mutation.isPending}
                      onClick={() => mutation.mutate({ id: item.id, action: "accept" })}
                    >
                      Принять
                    </button>
                    <button
                      className="btn secondary small"
                      disabled={mutation.isPending}
                      onClick={() => mutation.mutate({ id: item.id, action: "decline" })}
                    >
                      Отклонить
                    </button>
                  </>
                )}
                {canWithdraw && (
                  <button
                    className="btn secondary small"
                    disabled={mutation.isPending}
                    onClick={() => {
                      if (window.confirm("Отозвать заявку или приглашение?"))
                        mutation.mutate({ id: item.id, action: "withdraw" })
                    }}
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

export function ProjectApplicationPanel({
  project,
  isOwner,
  isMember,
}: {
  project: ProjectDetail
  isOwner: boolean
  isMember: boolean
}) {
  const viewer = useViewer()
  const [filter, setFilter] = useState<ApplicationStatus | "">("")
  const mine = useMyApplications(!!viewer && !isOwner)
  const all = useProjectApplications(project.id, !!viewer && isOwner, {
    status: filter || undefined,
  })
  const items = isOwner ? all.data : mine.data?.filter((item) => item.projectId === project.id)
  const pending = items?.some((item) => item.status === ApplicationStatus.PENDING)
  const roles = project.projectOpenRoles.filter((role) => role.slots > 0)
  const send = useProjectMutation(
    async ({
      roleId,
      message,
      username,
    }: {
      roleId: number
      message: string
      username?: string
    }) => {
      if (isOwner && username) {
        const target = await dictionariesApi.user(username.replace(/^@/, ""))
        return applicationsApi.invite(project.id, { userId: target.id, roleId, message })
      }
      return applicationsApi.apply(project.id, { roleId, message })
    },
  )
  const [message, setMessage] = useState("")
  const [username, setUsername] = useState("")
  const [roleId, setRoleId] = useState("")
  if (!viewer)
    return (
      <section className="entity-section">
        <h2>Вступить в проект</h2>
        <p className="reading">Войдите, чтобы отправить заявку.</p>
        <Link className="btn primary" href={loginUrl(`/projects/${project.id}`)}>
          Войти
        </Link>
      </section>
    )
  const listQuery = isOwner ? all : mine
  const canSend =
    roles.length > 0 &&
    (isOwner ||
      (!isMember &&
        !pending &&
        !mine.isPending &&
        !mine.isError &&
        project.status === ProjectStatus.RECRUITMENT))
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!roleId || (isOwner && !username.trim())) return
    send.mutate(
      {
        roleId: Number(roleId),
        message: message.trim(),
        username: isOwner ? username.trim() : undefined,
      },
      {
        onSuccess: () => {
          setMessage("")
          setUsername("")
          setRoleId("")
        },
      },
    )
  }
  return (
    <section className="entity-section">
      <h2>{isOwner ? "Заявки и приглашения проекта" : "Мои заявки и приглашения"}</h2>
      {canSend && (
        <form className="project-inline-form" onSubmit={submit}>
          <h3>{isOwner ? "Пригласить участника" : "Подать заявку"}</h3>
          {isOwner && (
            <div className="field">
              <label htmlFor="invite-username">Имя пользователя</label>
              <input
                id="invite-username"
                required
                maxLength={51}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="application-role">Открытая роль</label>
            <select
              id="application-role"
              required
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
            >
              <option value="">Выбери роль</option>
              {roles.map(({ role, slots }) => (
                <option value={role.id} key={role.id}>
                  {role.name} · {slots} мест
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="application-message">Сообщение</label>
            <textarea
              id="application-message"
              rows={3}
              maxLength={1000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Расскажи о себе или добавь пояснение"
            />
          </div>
          {send.isError && (
            <p className="field-error" role="alert">
              {apiErrorMessage(send.error)}
            </p>
          )}
          {send.isSuccess && (
            <p className="reading" role="status">
              {isOwner ? "Приглашение отправлено" : "Заявка отправлена"}.
            </p>
          )}
          <button className="btn primary" disabled={send.isPending} type="submit">
            {send.isPending
              ? "Отправляем…"
              : isOwner
                ? "Отправить приглашение"
                : "Отправить заявку"}
          </button>
        </form>
      )}
      {!isMember && !isOwner && !canSend && !pending && !mine.isPending && (
        <p className="reading">
          {project.status === ProjectStatus.RECRUITMENT
            ? "Нет доступных ролей."
            : "Набор в проект закрыт."}
        </p>
      )}
      {isOwner && (
        <div className="field">
          <label htmlFor="application-filter">Статус заявки</label>
          <select
            id="application-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as ApplicationStatus | "")}
          >
            <option value="">Все статусы</option>
            {Object.values(ApplicationStatus).map((value) => (
              <option value={value} key={value}>
                {applicationStatusLabels[value]}
              </option>
            ))}
          </select>
        </div>
      )}
      {listQuery.isPending ? (
        <p className="reading">Загружаем заявки…</p>
      ) : listQuery.isError ? (
        <div>
          <p className="field-error" role="alert">
            {apiErrorMessage(listQuery.error)}
          </p>
          <button className="btn secondary" onClick={() => listQuery.refetch()}>
            Повторить
          </button>
        </div>
      ) : (
        <ApplicationRows items={items ?? []} viewerId={viewer.id} />
      )}
    </section>
  )
}

export default function MyApplications() {
  const viewer = useViewer()
  const [status, setStatus] = useState<ApplicationStatus | "">("")
  const [type, setType] = useState<ApplicationType | "">("")
  const filters: ApplicationFilters = { status: status || undefined, type: type || undefined }
  const query = useMyApplications(!!viewer, filters)
  return (
    <BrowseLayout title="Мои заявки и приглашения" back="/projects">
      <section className="project-detail">
        <h1 className="text-2xl font-semibold">Мои заявки и приглашения</h1>
        {!viewer ? (
          <p className="reading">
            <Link className="btn primary" href={loginUrl("/projects/applications")}>
              Войти
            </Link>
          </p>
        ) : (
          <>
            <div className="form-grid mt-5">
              <div className="field">
                <label htmlFor="decision-status">Статус</label>
                <select
                  id="decision-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApplicationStatus | "")}
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
                <label htmlFor="decision-type">Тип</label>
                <select
                  id="decision-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as ApplicationType | "")}
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
            {query.isPending ? (
              <p className="reading">Загружаем заявки…</p>
            ) : query.isError ? (
              <>
                <p className="field-error" role="alert">
                  {apiErrorMessage(query.error)}
                </p>
                <button className="btn secondary" onClick={() => query.refetch()}>
                  Повторить
                </button>
              </>
            ) : (
              <ApplicationRows items={query.data} viewerId={viewer.id} showProject />
            )}
          </>
        )}
      </section>
    </BrowseLayout>
  )
}
