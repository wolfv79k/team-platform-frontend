"use client"

import "@/app/styles/catalog.css"
import "@/app/styles/catalog-details.css"
import Link from "next/link"
import { ArrowUpRight, ChevronDown, Plus, Search, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { useProjects, useSkills, useRoles } from "@/shared/lib/project-queries"
import { httpUrl, loginUrl, statusLabels, statusTone } from "@/shared/lib/project-display"
import { ProjectStatus } from "@/types/enums"
import type { ProjectListItem } from "@/types/api"
import { apiErrorMessage } from "@/services/api-error"
import { BrowseLayout } from "@/shared/components/shared/layout/browse-layout"
import { useViewer } from "@/shared/components/shared/layout/viewer-provider"
import { Icon } from "@/shared/components/ui/icon"
import { PhotoCover } from "./catalog-media"
import { Skills, Tag } from "./catalog-tags"

export function RealProjectCard({ project }: { project: ProjectListItem }) {
  const photo = httpUrl(project.coverImageUrls?.[0]) ?? httpUrl(project.logoUrl)
  const vacancies = project.projectOpenRoles.filter(({ slots }) => slots > 0)
  return (
    <article className="project-catalog-card">
      <Link
        className="project-tile"
        href={`/projects/${project.id}`}
        aria-labelledby={`catalog-title-${project.id}`}
      >
        {photo && (
          <div className="project-tile-photo">
            <PhotoCover photo={{ src: photo, width: 640, height: 360, alt: project.name }} />
          </div>
        )}
        <div className="project-tile-body">
          <div className="project-tile-meta">
            <Tag tone={statusTone[project.status]}>{statusLabels[project.status]}</Tag>
            <Icon icon={ArrowUpRight} className="project-tile-arrow" />
          </div>
          <h2 id={`catalog-title-${project.id}`}>{project.name}</h2>
          <p className="project-tile-description">
            {project.slogan || project.description || "Описание пока не добавлено"}
          </p>
          <Skills names={project.projectSkills.map(({ skill }) => skill.name)} />
          {vacancies.length > 0 && (
            <p className="project-tile-role">
              <Icon icon={Users} />
              <span>
                Открытые роли:{" "}
                {vacancies.map(({ role, slots }) => `${role.name} (${slots})`).join(", ")}
              </span>
            </p>
          )}
        </div>
      </Link>
    </article>
  )
}

export default function ProjectCatalog() {
  const viewer = useViewer()
  const [status, setStatus] = useState<ProjectStatus | "">("")
  const [input, setInput] = useState("")
  const [search, setSearch] = useState("")
  const [skillId, setSkillId] = useState("")
  const [roleId, setRoleId] = useState("")
  const [page, setPage] = useState(1)
  const skills = useSkills()
  const roles = useRoles()
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(input.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [input])
  const projects = useProjects({
    status: status || undefined,
    search: search || undefined,
    skillId: skillId ? Number(skillId) : undefined,
    roleId: roleId ? Number(roleId) : undefined,
    page,
    limit: 12,
  })
  const totalPages = Math.max(
    1,
    Math.ceil((projects.data?.total ?? 0) / (projects.data?.limit ?? 12)),
  )
  const reset = () => {
    setStatus("")
    setInput("")
    setSearch("")
    setSkillId("")
    setRoleId("")
    setPage(1)
  }
  return (
    <BrowseLayout title="Проекты">
      <section className="catalog-head">
        <h1>Проекты</h1>
        <p>Найди проект, в котором пригодятся твои навыки.</p>
        <div className="catalog-actions flex-wrap">
          <label className="searchbox">
            <Icon icon={Search} />
            <input
              id="catalog-search"
              type="search"
              aria-label="Поиск по проектам"
              placeholder="Поиск по проектам"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
          </label>
          <Link className="btn primary" href={viewer ? "/projects/new" : loginUrl("/projects/new")}>
            <Icon icon={Plus} />
            Создать проект
          </Link>
          {viewer && (
            <Link className="btn secondary" href="/projects/applications">
              Мои заявки и приглашения
            </Link>
          )}
        </div>
        <div className="catalog-actions flex-wrap mt-3">
          <div className="select-wrap">
            <select
              aria-label="Технология"
              value={skillId}
              onChange={(e) => {
                setSkillId(e.target.value)
                setPage(1)
              }}
              disabled={skills.isPending}
            >
              <option value="">Все технологии</option>
              {skills.data?.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
            <Icon icon={ChevronDown} />
          </div>
          <div className="select-wrap">
            <select
              aria-label="Открытая роль"
              value={roleId}
              onChange={(e) => {
                setRoleId(e.target.value)
                setPage(1)
              }}
              disabled={roles.isPending}
            >
              <option value="">Все роли</option>
              {roles.data?.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <Icon icon={ChevronDown} />
          </div>
          {(skills.isError || roles.isError) && (
            <button
              className="btn quiet small"
              onClick={() => {
                void skills.refetch()
                void roles.refetch()
              }}
            >
              Повторить загрузку фильтров
            </button>
          )}
        </div>
        <div className="catalog-filters" aria-label="Фильтры по статусу">
          {["", ...Object.values(ProjectStatus)].map((value) => (
            <button
              type="button"
              className={`filter ${status === value ? "active" : ""}`}
              key={value}
              aria-pressed={status === value}
              onClick={() => {
                setStatus(value as ProjectStatus | "")
                setPage(1)
              }}
            >
              {value ? statusLabels[value as ProjectStatus] : "Все проекты"}
            </button>
          ))}
        </div>
      </section>
      <section className="catalog-list project-catalog" aria-live="polite">
        {projects.isPending ? (
          <div className="empty-tab">
            <p>Загружаем проекты…</p>
          </div>
        ) : projects.isError ? (
          <div className="empty-tab">
            <h2>Не удалось загрузить проекты</h2>
            <p>{apiErrorMessage(projects.error)}</p>
            <button className="btn secondary" onClick={() => projects.refetch()}>
              Повторить
            </button>
          </div>
        ) : projects.data.items.length ? (
          <>
            <div className="project-cards">
              {projects.data.items.map((project) => (
                <RealProjectCard key={project.id} project={project} />
              ))}
            </div>
            <div className="project-pagination">
              <button
                className="btn secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Назад
              </button>
              <span>
                Страница {page} из {totalPages} · {projects.data.total} проектов
              </span>
              <button
                className="btn secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Далее
              </button>
            </div>
          </>
        ) : (
          <div className="empty-tab">
            <Icon icon={Search} />
            <h2>Ничего не найдено</h2>
            <p>Попробуй другой запрос или фильтры.</p>
            <button className="btn secondary" onClick={reset}>
              Сбросить фильтры
            </button>
            {page > 1 && (
              <button className="btn quiet" onClick={() => setPage(1)}>
                На первую страницу
              </button>
            )}
          </div>
        )}
      </section>
    </BrowseLayout>
  )
}
