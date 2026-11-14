"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowUpRight, Pencil, Users } from "lucide-react"
import { catalogPreview } from "@/shared/data/catalog-preview"
import { BrowseLayout } from "@/shared/components/shared/layout/browse-layout"
import { Icon } from "@/shared/components/ui/icon"
import { person } from "@/shared/lib/catalog-preview"
import { PhotoCover } from "./catalog-media"
import { Skills, Tag } from "./catalog-tags"

export default function ProjectDetail({
  project,
}: {
  project: (typeof catalogPreview.projects)[number]
}) {
  const [tab, setTab] = useState("about")
  const [contribution, setContribution] = useState(project.contribution)
  const [editing, setEditing] = useState(false)
  const photo =
    catalogPreview.demoProjectPhotos[
      String(project.id) as keyof typeof catalogPreview.demoProjectPhotos
    ]
  const contributor = person(project.id === 1 ? 2 : 3)
  const relatedIdea = catalogPreview.ideas.find((idea) => idea.projectId === project.id)

  return (
    <BrowseLayout title={`Проекты › ${project.name}`} back="/projects">
      <article className="project-detail">
        {photo && (
          <figure className="wide-photo project-detail-photo">
            <PhotoCover photo={photo} decorative={false} />
          </figure>
        )}
        <div className="detail-title">
          <div>
            <h1>{project.name}</h1>
            <p>{project.slogan}</p>
          </div>
          <Tag tone={project.status === "В работе" ? "green" : "blue"}>{project.status}</Tag>
        </div>
        <Skills names={project.skills} />
        <nav className="detail-tabs" aria-label="Разделы проекта">
          {[
            ["about", "О проекте"],
            ["members", "Команда"],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={tab === value ? "active" : ""}
              aria-pressed={tab === value}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </nav>
        {tab === "members" ? (
          <section>
            <h2>Команда проекта</h2>
            <ProjectMember name="Даниил Морозов" label={project.role + " / Автор"} />
            <ProjectMember
              name={contributor.name}
              label={project.id === 1 ? "UX/UI-дизайнер" : "Backend-разработчик"}
            />
            {project.need && (
              <div className="open-role">
                <Icon icon={Users} />
                <div>
                  <strong>{project.need}</strong>
                  <small>1 открытое место</small>
                </div>
                <Tag tone="blue">Ищем в команду</Tag>
              </div>
            )}
          </section>
        ) : (
          <>
            <h2>О проекте</h2>
            <p className="reading">{project.description}</p>
            {relatedIdea && (
              <div className="idea-origin">
                <strong>Проект вырос из идеи</strong>
                <Link href={`/ideas/${relatedIdea.id}`}>
                  {relatedIdea.name} <Icon icon={ArrowUpRight} />
                </Link>
              </div>
            )}
            <section className="contribution">
              <div className="flex-between">
                <h3>Мой вклад</h3>
                <button type="button" className="btn quiet small" onClick={() => setEditing(true)}>
                  <Icon icon={Pencil} />
                  Изменить
                </button>
              </div>
              {editing ? (
                <form
                  className="field"
                  onSubmit={(event) => {
                    event.preventDefault()
                    setContribution(
                      String(new FormData(event.currentTarget).get("contribution") ?? ""),
                    )
                    setEditing(false)
                  }}
                >
                  <label htmlFor="contribution">Мой вклад</label>
                  <textarea id="contribution" name="contribution" defaultValue={contribution} />
                  <button type="submit" className="btn primary small">
                    Применить в предпросмотре
                  </button>
                </form>
              ) : (
                <p>{contribution}</p>
              )}
            </section>
            <section className="entity-section">
              <h2>Автор проекта</h2>
              <ProjectMember name="Даниил Морозов" label={project.role} />
            </section>
          </>
        )}
      </article>
    </BrowseLayout>
  )
}

function ProjectMember({ name, label }: { name: string; label: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
  return (
    <div className="member-row">
      <span className="avatar initials small">{initials}</span>
      <div>
        <strong>{name}</strong>
        <small>{label}</small>
      </div>
    </div>
  )
}
