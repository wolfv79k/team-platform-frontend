"use client"

import "@/app/styles/catalog.css"
import "@/app/styles/catalog-details.css"
import "@/app/styles/forms.css"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowUpRight, Pencil, Trash2 } from "lucide-react"
import { projectsApi } from "@/services/projects.api"
import { apiErrorMessage } from "@/services/api-error"
import { projectKeys, useProject, useProjectMutation } from "@/shared/lib/project-queries"
import { httpUrl, statusLabels, statusTone } from "@/shared/lib/project-display"
import { useViewer } from "@/shared/components/shared/layout/viewer-provider"
import { BrowseLayout } from "@/shared/components/shared/layout/browse-layout"
import { ProfileAvatar } from "@/shared/components/shared/profile/profile-media"
import { Icon } from "@/shared/components/ui/icon"
import { PhotoCover } from "./catalog-media"
import { Skills, Tag } from "./catalog-tags"
import { ProjectApplicationPanel } from "./project-applications"
import {
  MyContribution,
  ProjectMembers,
  ProjectOpenRoles,
  ProjectSkills,
} from "./project-management"
import { ProjectStatus } from "@/types/enums"

export default function ProjectPage({ id }: { id: number }) {
  const viewer = useViewer()
  const query = useProject(id)
  const queryClient = useQueryClient()
  const router = useRouter()
  const [tab, setTab] = useState("about")
  const remove = useProjectMutation(() => projectsApi.remove(id))
  const changeStatus = useProjectMutation(async (status: ProjectStatus) => {
    const updated = await projectsApi.updateStatus(id, status)
    queryClient.setQueryData(projectKeys.detail(id), updated)
    return updated
  })
  if (query.isPending)
    return (
      <BrowseLayout title="Проекты" back="/projects">
        <div className="empty-tab">
          <p>Загружаем проект…</p>
        </div>
      </BrowseLayout>
    )
  if (!query.data || query.isError)
    return (
      <BrowseLayout title="Проекты" back="/projects">
        <div className="empty-tab">
          <h2>Не удалось открыть проект</h2>
          <p>{apiErrorMessage(query.error)}</p>
          <button className="btn secondary" onClick={() => query.refetch()}>
            Повторить
          </button>
          <Link className="btn quiet" href="/projects">
            Вернуться к проектам
          </Link>
        </div>
      </BrowseLayout>
    )
  const project = query.data
  const isOwner = viewer?.id === project.authorId
  const member = project.projectMembers.find((item) => item.userId === viewer?.id)
  const photos = project.coverImageUrls.map(httpUrl).filter((url): url is string => !!url)
  const logo = httpUrl(project.logoUrl)
  const name = project.author.name || project.author.username
  const projectUrl = httpUrl(project.projectUrl)
  const videoUrl = httpUrl(project.videoUrl)
  const onApply =
    !member && !isOwner && project.status === ProjectStatus.RECRUITMENT
      ? () => setTab("applications")
      : undefined
  return (
    <BrowseLayout title={`Проекты > ${project.name}`} back="/projects">
      <article className="project-detail">
        {photos[0] && (
          <figure className="wide-photo project-detail-photo">
            <PhotoCover
              photo={{ src: photos[0], width: 1200, height: 675, alt: project.name }}
              decorative={false}
            />
          </figure>
        )}
        <div className="detail-title">
          <div className="project-identity">
            {logo && (
              <PhotoCover
                className="project-logo"
                photo={{ src: logo, width: 72, height: 72, alt: project.name }}
                decorative={false}
              />
            )}
            <div>
              <h1>{project.name}</h1>
              {project.slogan && <p>{project.slogan}</p>}
            </div>
          </div>
          {isOwner ? (
            <div className="project-detail-status">
              <label htmlFor="project-detail-status">Статус проекта</label>
              <select
                id="project-detail-status"
                value={
                  changeStatus.isPending
                    ? (changeStatus.variables ?? project.status)
                    : project.status
                }
                disabled={changeStatus.isPending}
                onChange={(event) => changeStatus.mutate(event.target.value as ProjectStatus)}
              >
                {Object.values(ProjectStatus).map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
              {changeStatus.isPending && <small role="status">Сохраняем…</small>}
              {changeStatus.isError && (
                <small className="field-error" role="alert">
                  {apiErrorMessage(changeStatus.error)}
                </small>
              )}
              {changeStatus.isSuccess && <small role="status">Статус сохранён</small>}
            </div>
          ) : (
            <Tag tone={statusTone[project.status]}>{statusLabels[project.status]}</Tag>
          )}
        </div>
        <Skills names={project.projectSkills.map(({ skill }) => skill.name)} />
        <div className="project-action-row mt-4">
          {projectUrl && (
            <a
              className="btn secondary small"
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Открыть проект <Icon icon={ArrowUpRight} />
            </a>
          )}
          {videoUrl && (
            <a
              className="btn secondary small"
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Смотреть видео <Icon icon={ArrowUpRight} />
            </a>
          )}
          {isOwner && (
            <>
              <Link className="btn primary small" href={`/projects/${id}/edit`}>
                <Icon icon={Pencil} />
                Редактировать
              </Link>
              <button
                className="btn quiet small"
                disabled={remove.isPending}
                onClick={async () => {
                  if (!window.confirm(`Удалить проект «${project.name}»? Это действие необратимо.`))
                    return
                  try {
                    await remove.mutateAsync()
                    router.push("/projects")
                    router.refresh()
                  } catch {
                    /* shown below */
                  }
                }}
              >
                <Icon icon={Trash2} />
                Удалить
              </button>
            </>
          )}
          {onApply && project.projectOpenRoles.some((role) => role.slots > 0) && (
            <button className="btn primary small" onClick={onApply}>
              Подать заявку
            </button>
          )}
        </div>
        {remove.isError && (
          <p className="field-error" role="alert">
            {apiErrorMessage(remove.error)}
          </p>
        )}
        <nav className="detail-tabs" aria-label="Разделы проекта">
          {[
            ["about", "О проекте"],
            ["members", `Команда (${project.projectMembers.length})`],
            ["applications", "Заявки и приглашения"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={tab === value ? "active" : ""}
              aria-pressed={tab === value}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </nav>
        {tab === "about" ? (
          <>
            <h2>О проекте</h2>
            <p className="reading whitespace-pre-wrap">
              {project.description || "Автор ещё не добавил описание."}
            </p>
            <section className="entity-section">
              <h2>Автор проекта</h2>
              <div className="member-row">
                <ProfileAvatar name={name} url={project.author.avatarUrl} size={36} />
                <div>
                  <Link href={`/${encodeURIComponent(project.author.username)}`}>
                    <strong>{name}</strong>
                  </Link>
                  <small>Создан {new Date(project.createdAt).toLocaleDateString("ru-RU")}</small>
                </div>
              </div>
            </section>
            {project.idea && (
              <div className="idea-origin">
                <strong>Проект вырос из идеи «{project.idea.name}»</strong>
                {project.idea.description && (
                  <p className="reading whitespace-pre-wrap">{project.idea.description}</p>
                )}
              </div>
            )}
            {member && <MyContribution projectId={id} member={member} />}
            <ProjectSkills project={project} isOwner={isOwner} />
            {project.partners.length > 0 && (
              <section className="entity-section">
                <h2>Партнёры</h2>
                <div className="mini-skills">
                  {project.partners.map((partner, index) => (
                    <Tag key={`${partner}-${index}`}>{partner}</Tag>
                  ))}
                </div>
              </section>
            )}
            {photos.length > 1 && (
              <section className="entity-section">
                <h2>Галерея</h2>
                <div className="project-gallery">
                  {photos.slice(1).map((photo, index) => (
                    <a
                      key={`${photo}-${index}`}
                      href={photo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <PhotoCover
                        photo={{
                          src: photo,
                          width: 640,
                          height: 360,
                          alt: `Изображение проекта ${index + 2}`,
                        }}
                        decorative={false}
                      />
                    </a>
                  ))}
                </div>
              </section>
            )}
            <ProjectOpenRoles project={project} isOwner={isOwner} onApply={onApply} />
          </>
        ) : tab === "members" ? (
          <>
            <ProjectMembers project={project} viewerId={viewer?.id} isOwner={isOwner} />
            <ProjectOpenRoles project={project} isOwner={isOwner} onApply={onApply} />
            {member && <MyContribution projectId={id} member={member} />}
          </>
        ) : (
          <ProjectApplicationPanel project={project} isOwner={isOwner} isMember={!!member} />
        )}
      </article>
    </BrowseLayout>
  )
}
