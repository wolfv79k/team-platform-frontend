"use client"

import "@/app/styles/catalog.css"
import "@/app/styles/catalog-details.css"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Lightbulb, Link2, Plus, Search, Users } from "lucide-react"
import { ideasApi } from "@/services/ideas.api"
import { communitiesApi } from "@/services/communities.api"
import { apiErrorMessage } from "@/services/api-error"
import { BrowseLayout } from "@/shared/components/shared/layout/browse-layout"
import { useViewer } from "@/shared/components/shared/layout/viewer-provider"
import { ProfileAvatar } from "@/shared/components/shared/profile/profile-media"
import { Icon } from "@/shared/components/ui/icon"
import { catalogs } from "@/shared/lib/catalog-config"
import { plural } from "@/shared/lib/catalog-preview"
import {
  allCollectionPages,
  collectionKeys,
  type CollectionKind,
} from "@/shared/lib/collection-queries"
import { loginUrl } from "@/shared/lib/project-display"
import type { CommunityView, IdeaView, PageResponse } from "@/types/api"
import { Tag } from "./catalog-tags"

const pageSize = 12
const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Moscow",
})

function IdeaCard({ idea }: { idea: IdeaView }) {
  const author = idea.author.name || idea.author.username
  return (
    <article className="idea-entry">
      <div className="idea-entry-body">
        <h2 className="catalog-entry-title">
          <Link href={`/ideas/${idea.id}`}>{idea.name}</Link>
        </h2>
        <p className="catalog-excerpt">{idea.description || "Описание пока не добавлено."}</p>
        <div className="idea-entry-meta">
          <div className="idea-byline">
            <Link href={`/${encodeURIComponent(idea.author.username)}`}>
              <ProfileAvatar name={author} url={idea.author.avatarUrl} size={26} />
              {author}
            </Link>
            <time dateTime={idea.createdAt}>{dateFormat.format(new Date(idea.createdAt))}</time>
          </div>
          {idea.projectId && (
            <Link href={`/projects/${idea.projectId}`} className="idea-project-link">
              <Icon icon={Link2} /> Есть проект
            </Link>
          )}
        </div>
      </div>
      <div className="catalog-cover is-fallback" aria-hidden="true">
        <Icon icon={Lightbulb} />
      </div>
    </article>
  )
}

function CommunityCard({ community }: { community: CommunityView }) {
  const viewer = useViewer()
  return (
    <article className="community-card">
      <div className="community-card-summary">
        <div className="catalog-cover is-fallback" aria-hidden="true">
          <Icon icon={Users} />
        </div>
        <div className="community-card-body">
          <div className="catalog-title-line">
            <h2 className="catalog-entry-title">
              <Link href={`/communities/${community.id}`}>{community.name}</Link>
            </h2>
            {viewer?.id === community.creatorId && <Tag tone="blue">Ты создатель</Tag>}
          </div>
          <p className="catalog-excerpt">
            {community.description || "Описание пока не добавлено."}
          </p>
        </div>
      </div>
      <div className="community-card-meta">
        <span>
          <Icon icon={Users} />
          {plural(community.membersCount, "участник", "участника", "участников")}
        </span>
      </div>
    </article>
  )
}

export default function RealCollectionCatalog({ kind }: { kind: CollectionKind }) {
  const viewer = useViewer()
  const config = catalogs[kind]
  const isIdeas = kind === "ideas"
  const [input, setInput] = useState("")
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [page, setPage] = useState(1)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(input.trim())
      setPage(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [input])

  const localFiltering = filter !== "all" || (isIdeas && !!search)
  const communitySearch = isIdeas ? undefined : search || undefined
  const query = useQuery<PageResponse<IdeaView | CommunityView>>({
    queryKey: [...collectionKeys.catalog(kind), localFiltering ? "all" : page, communitySearch],
    queryFn: ({ signal }) => {
      if (isIdeas) {
        return localFiltering
          ? allCollectionPages((params) => ideasApi.list(params, signal))
          : ideasApi.list({ page, limit: pageSize }, signal)
      }
      return localFiltering
        ? allCollectionPages((params) =>
            communitiesApi.list({ ...params, search: communitySearch }, signal),
          )
        : communitiesApi.list({ page, limit: pageSize, search: communitySearch }, signal)
    },
  })
  const matching = (query.data?.items ?? []).filter((item) => {
    if ("authorId" in item) {
      return (
        (!search ||
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description?.toLowerCase().includes(search.toLowerCase())) &&
        (filter !== "mine" || item.authorId === viewer?.id) &&
        (filter !== "unlinked" || item.projectId === null)
      )
    }
    return filter !== "mine" || item.creatorId === viewer?.id
  })
  const total = localFiltering ? matching.length : (query.data?.total ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const items = localFiltering ? matching.slice((page - 1) * pageSize, page * pageSize) : matching
  const filters = [
    ["all", isIdeas ? "Все идеи" : "Все сообщества"],
    ...(isIdeas ? [["unlinked", "Без проекта"]] : []),
    ...(viewer ? [["mine", isIdeas ? "Мои идеи" : "Созданные мной"]] : []),
  ]
  const reset = () => {
    setInput("")
    setSearch("")
    setFilter("all")
    setPage(1)
  }
  const create = `/${kind}/new`

  return (
    <BrowseLayout title={config.title}>
      <section className="catalog-head">
        <h1>{config.title}</h1>
        <p>{config.description}</p>
        <div className="catalog-actions flex-wrap">
          <label className="searchbox">
            <Icon icon={Search} />
            <input
              type="search"
              aria-label="Поиск по названию"
              placeholder="Поиск по названию"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
          </label>
          <Link className="btn primary" href={viewer ? create : loginUrl(create)}>
            <Icon icon={Plus} /> {config.create}
          </Link>
        </div>
        <div className="catalog-filters" aria-label="Фильтр списка">
          {filters.map(([value, label]) => (
            <button
              type="button"
              className={`filter${filter === value ? " active" : ""}`}
              key={value}
              aria-pressed={filter === value}
              onClick={() => {
                setFilter(value)
                setPage(1)
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
      <section className="catalog-list" aria-label={config.title} aria-live="polite">
        {query.isPending ? (
          <div className="empty-tab">
            <p>Загружаем {isIdeas ? "идеи" : "сообщества"}…</p>
          </div>
        ) : query.isError ? (
          <div className="empty-tab">
            <h2>Не удалось загрузить список</h2>
            <p>{apiErrorMessage(query.error)}</p>
            <button className="btn secondary" onClick={() => query.refetch()}>
              Повторить
            </button>
          </div>
        ) : items.length ? (
          <div className={isIdeas ? "idea-index" : "community-grid"}>
            {items.map((item) =>
              "authorId" in item ? (
                <IdeaCard key={item.id} idea={item} />
              ) : (
                <CommunityCard key={item.id} community={item} />
              ),
            )}
          </div>
        ) : (
          <div className="empty-tab">
            <Icon icon={Search} />
            <h2>Ничего не найдено</h2>
            <button className="btn secondary" onClick={reset}>
              Сбросить фильтры
            </button>
          </div>
        )}
        {query.isSuccess && (totalPages > 1 || page > 1) && (
          <div className="project-pagination">
            <button
              className="btn secondary"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Назад
            </button>
            <span>
              Страница {page} из {totalPages} · {total} всего
            </span>
            <button
              className="btn secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Далее
            </button>
          </div>
        )}
      </section>
    </BrowseLayout>
  )
}
