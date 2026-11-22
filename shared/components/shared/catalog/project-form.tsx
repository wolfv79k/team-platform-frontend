"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { FolderPlus, Info, Pencil } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { projectsApi } from "@/services/projects.api"
import { ideasApi } from "@/services/ideas.api"
import { apiErrorMessage } from "@/services/api-error"
import { BrowseLayout } from "@/shared/components/shared/layout/browse-layout"
import { useViewer } from "@/shared/components/shared/layout/viewer-provider"
import {
  formValue,
  readProjectFields,
  readProjectStatus,
  selectedProjectSkills,
  syncProjectSkills,
  syncProjectVacancies,
  useCreateProjectForm,
  validateProjectFields,
  validateVacancies,
  type SelectedSkill,
  type SelectedVacancy,
} from "@/shared/lib/project-form-submit"
import { loginUrl } from "@/shared/lib/project-display"
import { useProject, useProjectMutation } from "@/shared/lib/project-queries"
import { ProjectStatus } from "@/types/enums"
import type { IdeaView, ProjectDetail, ProjectFields } from "@/types/api"
import {
  FormField,
  FormHeading,
  FormSection,
  ProjectFormFooter,
  ProjectMediaField,
  RoleField,
  SkillsField,
  StatusField,
  VacanciesField,
} from "./project-form-fields"

function IdeaPicker({ viewerId }: { viewerId: number }) {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const query = useQuery({
    queryKey: ["ideas", "picker", page],
    queryFn: () => ideasApi.list({ page, limit: 50 }),
    enabled: open,
  })
  const ideas =
    query.data?.items.filter((idea) => idea.authorId === viewerId && !idea.projectId) ?? []
  return (
    <div className="project-form-idea-picker">
      <button
        type="button"
        className="project-form-text-button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Скрыть идеи" : "Создать из существующей идеи"}
      </button>
      {open && (
        <div className="project-form-card">
          {query.isPending ? (
            <p>Загружаем идеи…</p>
          ) : query.isError ? (
            <p>
              {apiErrorMessage(query.error)}{" "}
              <button
                type="button"
                className="project-form-text-button"
                onClick={() => query.refetch()}
              >
                Повторить
              </button>
            </p>
          ) : (
            <>
              {!ideas.length && <p>На этой странице нет свободных идей.</p>}
              {ideas.map((idea) => (
                <div className="project-form-idea-row" key={idea.id}>
                  <strong>{idea.name}</strong>
                  <Link href={`/projects/new?ideaId=${idea.id}`} className="btn secondary small">
                    Выбрать
                  </Link>
                </div>
              ))}
              {(page > 1 || page * 50 < query.data.total) && (
                <div className="project-form-action-buttons">
                  <button
                    type="button"
                    disabled={page === 1}
                    className="btn secondary small"
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Назад
                  </button>
                  <button
                    type="button"
                    disabled={page * 50 >= query.data.total}
                    className="btn secondary small"
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Далее
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function CommonProjectCreateForm({ viewerId, idea }: { viewerId: number; idea?: IdeaView }) {
  const router = useRouter()
  const [skills, setSkills] = useState<SelectedSkill[]>([])
  const [vacancies, setVacancies] = useState<SelectedVacancy[]>([])
  const [status, setStatus] = useState(ProjectStatus.RECRUITMENT)
  const [validation, setValidation] = useState("")
  const { mutation, createdId } = useCreateProjectForm(viewerId, idea?.id)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mutation.isPending) return
    const data = new FormData(event.currentTarget)
    const fields = readProjectFields(data)
    const roleId = Number(formValue(data, "roleId"))
    const error =
      validateProjectFields(fields) ||
      (!Number.isInteger(roleId) || roleId < 1 ? "Выберите свою роль в проекте." : "") ||
      validateVacancies(vacancies)
    setValidation(error)
    if (error) return
    try {
      const id = await mutation.mutateAsync({
        fields,
        roleId,
        status: readProjectStatus(data, status),
        skills,
        vacancies,
        contribution: formValue(data, "contribution"),
      })
      router.push(`/projects/${id}`)
      router.refresh()
    } catch {
      /* error displayed in the footer */
    }
  }

  return (
    <form className="project-form" onSubmit={submit}>
      <FormHeading
        icon={FolderPlus}
        title="Создать проект"
        description="Представь свою идею, собери команду и начни совместную работу."
      />
      {!idea && <IdeaPicker viewerId={viewerId} />}
      <fieldset className="project-form-content" disabled={mutation.isPending}>
        <FormSection
          title="Основная информация"
          description="Расскажи, над чем работаешь и зачем нужен проект."
        >
          {idea && (
            <div className="project-form-note">
              <Info size={16} />
              <p>Проект создаётся из идеи «{idea.name}».</p>
            </div>
          )}
          <FormField
            name="name"
            label="Название проекта"
            initial={idea?.name}
            required
            max={100}
            placeholder="Например, TeamPlatform"
          />
          <FormField
            name="slogan"
            label="Краткое описание"
            max={160}
            placeholder="Опиши идею в одном предложении"
            hint="До 160 символов — текст для карточки проекта в каталоге."
          />
          <FormField
            name="description"
            label="О проекте"
            initial={idea?.description}
            rows={6}
            placeholder="Какую проблему решает проект, что уже готово и чего хочешь достичь?"
          />
          <div className="project-form-grid">
            <RoleField label="Твоя роль в проекте" />
            <StatusField value={status} onChange={setStatus} />
          </div>
          <FormField name="contribution" label="Твой вклад" rows={4} max={1000} placeholder="Какие задачи ты выполняешь в проекте?" />
        </FormSection>
        <FormSection
          title="Технологии и команда"
          description="Выбери стек проекта и укажи, кого хочешь найти."
        >
          <SkillsField value={skills} onChange={setSkills} disabled={mutation.isPending} />
          <VacanciesField value={vacancies} onChange={setVacancies} />
          {status !== ProjectStatus.RECRUITMENT && vacancies.length > 0 && (
            <div className="project-form-note">
              <Info size={16} />
              <p>
                Роли будут сохранены, но принимать заявки можно только в статусе «Набор в команду».
              </p>
            </div>
          )}
        </FormSection>
        <FormSection
          title="Ссылки и дополнительные сведения"
          description="Необязательно. Помоги участникам познакомиться с проектом."
        >
          <FormField
            name="projectUrl"
            label="Ссылка на проект"
            type="url"
            max={500}
            placeholder="https://..."
          />
          <FormField name="partners" label="Партнёры" placeholder="Названия через запятую" />
        </FormSection>
        <ProjectMediaField />
      </fieldset>
      <ProjectFormFooter
        back="/projects"
        submitLabel="Создать проект"
        pending={mutation.isPending}
        error={validation || (mutation.isError ? apiErrorMessage(mutation.error) : "")}
        createdId={createdId}
      />
    </form>
  )
}

export function NewProjectForm({ ideaId }: { ideaId?: number }) {
  const viewer = useViewer()
  const idea = useQuery({
    queryKey: ["ideas", "detail", ideaId],
    queryFn: () => ideasApi.get(ideaId!),
    enabled: !!ideaId,
  })
  if (!viewer)
    return (
      <BrowseLayout title="Новый проект" back="/projects">
        <div className="empty-tab">
          <p>Войдите, чтобы продолжить.</p>
          <Link
            className="btn primary"
            href={loginUrl(`/projects/new${ideaId ? `?ideaId=${ideaId}` : ""}`)}
          >
            Войти
          </Link>
        </div>
      </BrowseLayout>
    )
  if (ideaId && !idea.data)
    return (
      <BrowseLayout title="Новый проект" back="/projects">
        <div className="empty-tab">
          <p>{idea.isError ? apiErrorMessage(idea.error) : "Загружаем идею…"}</p>
          {idea.isError && (
            <button className="btn secondary" onClick={() => idea.refetch()}>
              Повторить
            </button>
          )}
        </div>
      </BrowseLayout>
    )
  if (idea.data && (idea.data.authorId !== viewer.id || idea.data.projectId))
    return (
      <BrowseLayout title="Новый проект" back="/projects">
        <div className="empty-tab">
          <h2>Идею нельзя преобразовать</h2>
          <p>Проект можно создать из собственной свободной идеи.</p>
          {idea.data.projectId && (
            <Link className="btn primary" href={`/projects/${idea.data.projectId}`}>
              Открыть проект
            </Link>
          )}
        </div>
      </BrowseLayout>
    )
  return (
    <BrowseLayout title="Проекты › Создание" back="/projects">
      <CommonProjectCreateForm
        key={ideaId ?? "new"}
        viewerId={viewer.id}
        idea={ideaId ? idea.data : undefined}
      />
    </BrowseLayout>
  )
}

function CommonProjectEditForm({ project }: { project: ProjectDetail }) {
  const router = useRouter()
  const member = project.projectMembers.find((item) => item.userId === project.authorId)
  const [status, setStatus] = useState(project.status)
  const [skills, setSkills] = useState(() => selectedProjectSkills(project))
  const [originalVacancies] = useState(() => project.projectOpenRoles.map(({ role, slots }) => ({ id: role.id, name: role.name, slots })))
  const [vacancies, setVacancies] = useState(originalVacancies)
  const [validation, setValidation] = useState("")
  const mutation = useProjectMutation(
    async ({
      fields,
      status,
      skills,
      roleId,
      contribution,
    }: {
      fields: ProjectFields
      status: ProjectStatus
      skills: SelectedSkill[]
      roleId: number
      contribution: string
    }) => {
      const updated = await projectsApi.update(project.id, { ...fields, status })
      if (updated.status !== status) throw new Error("Сервер не подтвердил изменение статуса проекта.")
      await syncProjectSkills(project.id, skills)
      await syncProjectVacancies(project.id, vacancies, originalVacancies)
      const currentMember = updated.projectMembers.find((item) => item.userId === project.authorId)
      if (currentMember && currentMember.roleId !== roleId) await projectsApi.changeMemberRole(project.id, project.authorId, roleId)
      if (currentMember && (currentMember.contribution ?? "") !== contribution) await projectsApi.updateContribution(project.id, contribution)
    },
  )
  const back = `/projects/${project.id}`
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const fields = readProjectFields(data)
    const roleId = Number(formValue(data, "roleId"))
    const error = validateProjectFields(fields) || (!Number.isInteger(roleId) || roleId < 1 ? "Выберите свою роль в проекте." : "") || validateVacancies(vacancies, originalVacancies)
    setValidation(error)
    if (error || mutation.isPending) return
    try {
      await mutation.mutateAsync({ fields, status: readProjectStatus(data, status), skills, roleId, contribution: formValue(data, "contribution") })
      router.push(back)
      router.refresh()
    } catch {
      /* error displayed below */
    }
  }
  return (
    <form className="project-form" onSubmit={submit}>
      <FormHeading
        icon={Pencil}
        title="Редактировать проект"
        description="Обнови информацию, статус, технологии или медиа проекта."
      />
      <fieldset className="project-form-content" disabled={mutation.isPending}>
        <FormSection title="Основная информация">
          <FormField
            name="name"
            label="Название проекта"
            initial={project.name}
            required
            max={100}
          />
          <FormField
            name="slogan"
            label="Краткое описание"
            initial={project.slogan}
            max={160}
            hint="До 160 символов"
          />
          <FormField name="description" label="О проекте" initial={project.description} rows={6} />
          <div className="project-form-grid">
            <RoleField label="Твоя роль в проекте" initial={member?.role} />
            <StatusField value={status} onChange={setStatus} />
          </div>
          <FormField name="contribution" label="Твой вклад" initial={member?.contribution} rows={4} max={1000} />
        </FormSection>
        <FormSection title="Технологии и команда">
          <SkillsField value={skills} onChange={setSkills} disabled={mutation.isPending} />
          <VacanciesField value={vacancies} onChange={setVacancies} existing={originalVacancies} />
        </FormSection>
        <FormSection title="Ссылки и дополнительные сведения">
          <FormField
            name="projectUrl"
            label="Ссылка на проект"
            initial={project.projectUrl}
            type="url"
            max={500}
          />
          <FormField name="partners" label="Партнёры" initial={project.partners?.join(", ")} />
        </FormSection>
        <ProjectMediaField videoUrl={project.videoUrl} />
      </fieldset>
      <ProjectFormFooter
        back={back}
        submitLabel="Сохранить"
        pending={mutation.isPending}
        error={validation || (mutation.isError ? apiErrorMessage(mutation.error) : "")}
      />
    </form>
  )
}

export function EditProjectForm({ id }: { id: number }) {
  const query = useProject(id)
  const viewer = useViewer()
  const back = `/projects/${id}`
  return (
    <BrowseLayout title="Редактирование проекта" back={back}>
      {!query.data ? (
        <div className="empty-tab">
          <p>{query.isError ? apiErrorMessage(query.error) : "Загружаем проект…"}</p>
          {query.isError && (
            <button className="btn secondary" onClick={() => query.refetch()}>
              Повторить
            </button>
          )}
        </div>
      ) : query.data.authorId !== viewer?.id ? (
        <div className="empty-tab">
          <h2>Недостаточно прав</h2>
          <p>Редактировать проект может только автор.</p>
        </div>
      ) : (
        <CommonProjectEditForm key={id} project={query.data} />
      )}
    </BrowseLayout>
  )
}
