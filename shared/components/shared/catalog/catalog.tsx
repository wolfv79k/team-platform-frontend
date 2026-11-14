"use client"

import "@/app/styles/catalog.css"

import Link from "next/link"
import { ChevronDown, Plus, Search } from "lucide-react"
import { useState } from "react"
import { catalogPreview } from "@/shared/data/catalog-preview"
import { Icon } from "@/shared/components/ui/icon"
import { eventIsPast } from "@/shared/lib/catalog-preview"
import { CommunityCard, EventCard, IdeaCard, ProjectCard, TeamCard } from "./catalog-cards"
import { catalogs, type CatalogKind } from "@/shared/lib/catalog-config"
import { BrowseLayout } from "@/shared/components/shared/layout/browse-layout"

export default function Catalog({ kind }: { kind: CatalogKind }) {
  const config = catalogs[kind]
  const initial = config.filters[0][0]
  const [filter, setFilter] = useState<string>(initial)
  const [query, setQuery] = useState("")
  const [technology, setTechnology] = useState("")
  const matches = ({ name }: { name: string }) =>
    name.toLowerCase().includes(query.trim().toLowerCase())
  const technologies = [...new Set(catalogPreview.teams.flatMap(({ skills }) => skills))]
  let cards: React.ReactNode[] = []
  let listClass = ""

  switch (kind) {
    case "projects":
      listClass = "project-cards"
      cards = catalogPreview.projects
        .filter((item) => matches(item) && (filter === "all" || item.status === filter))
        .map((item) => <ProjectCard key={item.id} project={item} />)
      break
    case "ideas":
      listClass = "idea-index"
      cards = catalogPreview.ideas
        .filter(
          (item) =>
            matches(item) &&
            (filter !== "mine" || item.authorId === 1) &&
            (filter !== "unlinked" || !item.projectId),
        )
        .map((item) => <IdeaCard key={item.id} idea={item} />)
      break
    case "teams":
      listClass = "team-index"
      cards = catalogPreview.teams
        .filter(
          (item) =>
            matches(item) &&
            (filter !== "mine" || item.members.includes(1)) &&
            (!technology || item.skills.includes(technology)),
        )
        .map((item) => <TeamCard key={item.id} team={item} />)
      break
    case "communities":
      listClass = "community-grid"
      cards = catalogPreview.communities
        .filter((item) => matches(item) && (filter !== "mine" || item.members.includes(1)))
        .map((item) => <CommunityCard key={item.id} community={item} />)
      break
    case "events":
      listClass = "event-index"
      cards = catalogPreview.events
        .filter(
          (item) =>
            matches(item) &&
            (filter === "past"
              ? eventIsPast(item)
              : filter === "upcoming"
                ? !eventIsPast(item)
                : catalogPreview.teams.some(
                    (team) =>
                      team.members.includes(1) && team.eventIds.some((id) => id === item.id),
                  )),
        )
        .map((item) => <EventCard key={item.id} event={item} />)
  }

  function reset() {
    setFilter(initial)
    setQuery("")
    setTechnology("")
  }

  return (
    <BrowseLayout title={config.title}>
      <section className="catalog-head">
        <h1>{config.title}</h1>
        <p>{config.description}</p>
        <div className="catalog-actions">
          <label className="searchbox">
            <Icon icon={Search} />
            <input
              id={kind === "projects" ? "catalog-search" : "collection-search"}
              type="search"
              aria-label="Поиск по названию"
              placeholder="Поиск по названию"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {kind === "teams" && (
            <div className="catalog-tech">
              <div className="select-wrap">
                <select
                  aria-label="Технология"
                  value={technology}
                  onChange={(event) => setTechnology(event.target.value)}
                >
                  <option value="">Все технологии</option>
                  {technologies.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
                <Icon icon={ChevronDown} />
              </div>
            </div>
          )}
          {"create" in config && (
            <Link href={`/${kind}/new`} className="btn primary">
              <Icon icon={Plus} />
              {config.create}
            </Link>
          )}
        </div>
        <div className="catalog-filters" aria-label="Фильтр списка">
          {config.filters.map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={`filter ${filter === value ? "active" : ""}`}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
      <section
        className={`catalog-list ${kind === "projects" ? "project-catalog" : ""}`}
        aria-label={config.title}
        aria-live="polite"
      >
        {kind === "teams" && filter === "applications" ? (
          <section className="entity-section">
            <h2>Заявки и приглашения</h2>
            {catalogPreview.teamApplications
              .filter((item) => item.userId === 1)
              .map((item) => (
                <p key={item.id} className="reading">
                  {item.message}
                </p>
              ))}
          </section>
        ) : cards.length ? (
          <div className={listClass}>{cards}</div>
        ) : (
          <div className="empty-tab">
            <Icon icon={Search} />
            <h2>Ничего не найдено</h2>
            <p>Попробуй другой запрос или сбрось фильтры.</p>
            <button type="button" className="btn secondary" onClick={reset}>
              Сбросить фильтры
            </button>
          </div>
        )}
      </section>
    </BrowseLayout>
  )
}
