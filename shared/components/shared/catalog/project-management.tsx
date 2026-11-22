"use client"

import "@/app/styles/forms.css"
import Link from "next/link"
import { useState, type FormEvent } from "react"
import { Pencil, Users } from "lucide-react"
import { projectsApi } from "@/services/projects.api"
import { apiErrorMessage } from "@/services/api-error"
import { useProjectMutation, useRoles } from "@/shared/lib/project-queries"
import { levelLabels } from "@/shared/lib/project-display"
import {
  selectedProjectSkills,
  syncProjectSkills,
  type SelectedSkill,
} from "@/shared/lib/project-form-submit"
import type { ProjectDetail, ProjectMemberView } from "@/types/api"
import { ProfileAvatar } from "@/shared/components/shared/profile/profile-media"
import { Icon } from "@/shared/components/ui/icon"
import { Tag } from "./catalog-tags"
import { SkillsField } from "./project-form-fields"

function ProjectSkillsEditor({ project, close }: { project: ProjectDetail; close: () => void }) {
  const [selected, setSelected] = useState(() => selectedProjectSkills(project))
  const mutation = useProjectMutation((skills: SelectedSkill[]) =>
    syncProjectSkills(project.id, skills),
  )
  return (
    <form
      className="project-inline-form"
      onSubmit={(event) => {
        event.preventDefault()
        mutation.mutate(selected, { onSuccess: close })
      }}
    >
      <SkillsField
        value={selected}
        onChange={setSelected}
        disabled={mutation.isPending}
        id="project-skill-search"
      />
      {mutation.isError && (
        <p className="field-error" role="alert">
          {apiErrorMessage(mutation.error)}
        </p>
      )}
      <div className="project-action-row mt-3">
        <button
          className="btn secondary small"
          type="button"
          disabled={mutation.isPending}
          onClick={close}
        >
          Отмена
        </button>
        <button className="btn primary small" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Сохраняем…" : "Сохранить стек"}
        </button>
      </div>
    </form>
  )
}

export function ProjectSkills({ project, isOwner }: { project: ProjectDetail; isOwner: boolean }) {
  const [editing, setEditing] = useState(false)
  return (
    <section className="entity-section">
      <div className="flex-between">
        <h2>Технологии и навыки</h2>
        {isOwner && !editing && (
          <button type="button" className="btn secondary small" onClick={() => setEditing(true)}>
            <Icon icon={Pencil} /> Изменить стек
          </button>
        )}
      </div>
      {editing && isOwner ? (
        <ProjectSkillsEditor project={project} close={() => setEditing(false)} />
      ) : (
        <>
          {!project.projectSkills.length && <p className="reading">Технологии пока не указаны.</p>}
          {project.projectSkills.map(({ skill, skillLevel }) => (
            <div key={skill.id} className="project-relation-row">
              <div>
                <strong>{skill.name}</strong>
                <small>{levelLabels[skillLevel]}</small>
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  )
}

export function ProjectOpenRoles({
  project,
  isOwner,
  onApply,
}: {
  project: ProjectDetail
  isOwner: boolean
  onApply?: () => void
}) {
  const roles = useRoles(isOwner)
  const [roleId, setRoleId] = useState("")
  const [slots, setSlots] = useState(1)
  const mutation = useProjectMutation(async (input: { roleId: number; slots?: number }) => {
    if (input.slots !== undefined)
      await projectsApi.setRole(project.id, input.roleId, { slots: input.slots })
    else await projectsApi.removeRole(project.id, input.roleId)
  })
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (roleId && Number.isInteger(slots) && slots >= 1 && slots <= 20)
      mutation.mutate(
        { roleId: Number(roleId), slots },
        {
          onSuccess: () => {
            setRoleId("")
            setSlots(1)
          },
        },
      )
  }
  return (
    <section className="entity-section">
      <h2>Открытые роли</h2>
      {!project.projectOpenRoles.length && <p className="reading">Открытых ролей пока нет.</p>}
      {project.projectOpenRoles.map(({ role, slots }) => (
        <div className="open-role" key={role.id}>
          <Icon icon={Users} />
          <div>
            <strong>{role.name}</strong>
            <small>Свободных мест: {slots}</small>
          </div>
          <Tag tone={slots > 0 ? "blue" : ""}>{slots > 0 ? "Ищем в команду" : "Нет мест"}</Tag>
          {isOwner ? (
            <div className="project-action-row">
              <button
                className="btn quiet small"
                disabled={mutation.isPending}
                onClick={() => {
                  setRoleId(String(role.id))
                  setSlots(Math.max(1, slots))
                }}
              >
                Изменить
              </button>
              <button
                className="btn secondary small"
                disabled={mutation.isPending}
                onClick={() => {
                  if (window.confirm(`Удалить открытую роль «${role.name}»?`))
                    mutation.mutate({ roleId: role.id })
                }}
              >
                Удалить
              </button>
            </div>
          ) : (
            slots > 0 &&
            onApply && (
              <button className="btn primary small" onClick={onApply}>
                Подать заявку
              </button>
            )
          )}
        </div>
      ))}
      {isOwner && (
        <form className="project-inline-form" onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="open-role">Роль</label>
              <select
                id="open-role"
                required
                disabled={roles.isPending}
                value={roleId}
                onChange={(event) => setRoleId(event.target.value)}
              >
                <option value="">Выбери роль</option>
                {roles.data?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="role-slots">Количество свободных мест</label>
              <input
                id="role-slots"
                required
                type="number"
                min={1}
                max={20}
                step={1}
                value={slots}
                onChange={(event) => setSlots(Number(event.target.value))}
              />
            </div>
          </div>
          {roles.isError && (
            <button type="button" className="btn quiet" onClick={() => roles.refetch()}>
              Не удалось загрузить роли. Повторить
            </button>
          )}
          {mutation.isError && (
            <p className="field-error" role="alert">
              {apiErrorMessage(mutation.error)}
            </p>
          )}
          <button
            className="btn primary small"
            disabled={mutation.isPending || roles.isPending}
            type="submit"
          >
            {mutation.isPending ? "Сохраняем…" : "Сохранить роль"}
          </button>
        </form>
      )}
    </section>
  )
}

export function MemberSummary({
  member,
  isAuthor,
}: {
  member: ProjectMemberView
  isAuthor?: boolean
}) {
  const user = member.user
  const name = user.name || user.username
  return (
    <div className="member-row">
      <ProfileAvatar name={name} url={user.avatarUrl} size={36} />
      <div>
        <Link href={`/${encodeURIComponent(user.username)}`}>
          <strong>{name}</strong>
        </Link>
        <small>
          {member.role.name}
          {isAuthor ? " · Автор проекта" : ""}
        </small>
      </div>
    </div>
  )
}

export function MyContribution({
  member,
  projectId,
}: {
  member: ProjectMemberView
  projectId: number
}) {
  const [editing, setEditing] = useState(false)
  const mutation = useProjectMutation((contribution: string) =>
    projectsApi.updateContribution(projectId, contribution),
  )
  return (
    <section className="contribution">
      <div className="flex-between">
        <h3>Мой вклад</h3>
        {!editing && (
          <button className="btn quiet small" onClick={() => setEditing(true)}>
            <Icon icon={Pencil} />
            Изменить
          </button>
        )}
      </div>
      {editing ? (
        <form
          className="field"
          onSubmit={(event) => {
            event.preventDefault()
            mutation.mutate(
              String(new FormData(event.currentTarget).get("contribution") ?? "").trim(),
              { onSuccess: () => setEditing(false) },
            )
          }}
        >
          <label htmlFor="contribution">Опиши свой вклад в проект</label>
          <textarea
            id="contribution"
            name="contribution"
            rows={4}
            maxLength={1000}
            defaultValue={member.contribution ?? ""}
          />
          <div className="project-action-row">
            <button type="submit" disabled={mutation.isPending} className="btn primary small">
              {mutation.isPending ? "Сохраняем…" : "Сохранить"}
            </button>
            <button
              type="button"
              disabled={mutation.isPending}
              className="btn quiet small"
              onClick={() => setEditing(false)}
            >
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <p className="whitespace-pre-wrap">
          {member.contribution || "Ты ещё не описал свой вклад."}
        </p>
      )}
      {mutation.isError && (
        <p className="field-error" role="alert">
          {apiErrorMessage(mutation.error)}
        </p>
      )}
    </section>
  )
}

export function ProjectMembers({
  project,
  viewerId,
  isOwner,
}: {
  project: ProjectDetail
  viewerId?: number
  isOwner: boolean
}) {
  const roles = useRoles(isOwner)
  const mutation = useProjectMutation(async (input: { userId: number; roleId?: number }) => {
    if (input.roleId !== undefined)
      await projectsApi.changeMemberRole(project.id, input.userId, input.roleId)
    else if (input.userId === viewerId) await projectsApi.leave(project.id)
    else await projectsApi.removeMember(project.id, input.userId)
  })
  return (
    <section className="entity-section">
      <h2>Участники проекта ({project.projectMembers.length})</h2>
      {project.projectMembers.map((member) => (
        <article className="project-member-item" key={member.userId}>
          <MemberSummary member={member} isAuthor={member.userId === project.authorId} />
          {member.contribution && (
            <p className="reading whitespace-pre-wrap">{member.contribution}</p>
          )}
          {isOwner && (
            <div className="project-action-row">
              <select
                aria-label={`Роль ${member.user.username}`}
                disabled={mutation.isPending || roles.isPending}
                value={member.roleId}
                onChange={(event) =>
                  mutation.mutate({ userId: member.userId, roleId: Number(event.target.value) })
                }
              >
                {!roles.data?.some((role) => role.id === member.roleId) && (
                  <option value={member.roleId}>{member.role.name}</option>
                )}
                {roles.data?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {member.userId !== project.authorId && (
                <button
                  className="btn secondary small"
                  disabled={mutation.isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Исключить ${member.user.name || member.user.username} из проекта?`,
                      )
                    )
                      mutation.mutate({ userId: member.userId })
                  }}
                >
                  Исключить
                </button>
              )}
            </div>
          )}
          {!isOwner && member.userId === viewerId && (
            <button
              className="btn secondary small"
              disabled={mutation.isPending}
              onClick={() => {
                if (window.confirm("Выйти из проекта?")) mutation.mutate({ userId: member.userId })
              }}
            >
              Покинуть проект
            </button>
          )}
        </article>
      ))}
      {isOwner && roles.isError && (
        <button className="btn quiet small" onClick={() => roles.refetch()}>
          Повторить загрузку ролей
        </button>
      )}
      {mutation.isError && (
        <p className="field-error" role="alert">
          {apiErrorMessage(mutation.error)}
        </p>
      )}
    </section>
  )
}
