import "@/app/styles/catalog.css"
import "@/app/styles/catalog-details.css"

import Link from "next/link"
import { ArrowUpRight, Calendar, Link2, MapPin, MessageCircle, Users } from "lucide-react"
import { catalogPreview } from "@/shared/data/catalog-preview"
import { eventIsPast, person, plural } from "@/shared/lib/catalog-preview"
import { Icon } from "@/shared/components/ui/icon"
import { PhotoCover, type CatalogPhoto } from "./catalog-media"
import { Skills, Tag } from "./catalog-tags"

type Item<K extends keyof typeof catalogPreview> =
  (typeof catalogPreview)[K] extends readonly (infer T)[] ? T : never
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
function Cover({ photo, name }: { photo: CatalogPhoto; name?: string }) {
  return (
    <div className={`catalog-cover${photo ? "" : " is-fallback"}`} aria-hidden="true">
      {photo ? <PhotoCover photo={photo} /> : name ? initials(name) : <Icon icon={Users} />}
    </div>
  )
}

export function ProjectCard({ project }: { project: Item<"projects"> }) {
  const photo = (catalogPreview.demoProjectPhotos as Record<number, CatalogPhoto>)[project.id]
  return (
    <article className="project-catalog-card">
      <Link
        className="project-tile"
        href={`/projects/${project.id}`}
        aria-labelledby={`catalog-title-${project.id}`}
      >
        {photo && (
          <div className="project-tile-photo">
            <PhotoCover photo={photo} />
          </div>
        )}
        <div className="project-tile-body">
          <div className="project-tile-meta">
            <Tag
              tone={
                project.status === "Набор в команду"
                  ? "blue"
                  : project.status === "В работе"
                    ? "green"
                    : ""
              }
            >
              {project.status}
            </Tag>
            <Icon icon={ArrowUpRight} className="project-tile-arrow" />
          </div>
          <h2 id={`catalog-title-${project.id}`}>{project.name}</h2>
          <p className="project-tile-description">{project.slogan || project.description}</p>
          <Skills names={project.skills} />
          {project.need && (
            <p className="project-tile-role">
              <Icon icon={Users} />
              <span>Открытая роль: {project.need}</span>
            </p>
          )}
        </div>
      </Link>
    </article>
  )
}

export function IdeaCard({ idea }: { idea: Item<"ideas"> }) {
  const author = person(idea.authorId)
  return (
    <article className="idea-entry">
      <div className="idea-entry-body">
        <h2 className="catalog-entry-title">
          <Link href={`/ideas/${idea.id}`}>{idea.name}</Link>
        </h2>
        <p className="catalog-excerpt">{idea.description}</p>
        <div className="idea-entry-meta">
          <div className="idea-byline">
            <Link href={`/${author.username}`}>
              <span className="avatar initials tiny">{initials(author.name)}</span>
              <span>{author.name}</span>
            </Link>
            <time dateTime={idea.createdAt}>
              {new Intl.DateTimeFormat("ru-RU", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "Europe/Moscow",
              })
                .format(new Date(idea.createdAt))
                .replaceAll(/\s/g, " ")}
            </time>
          </div>
          {idea.projectId && (
            <Link href={`/projects/${idea.projectId}`} className="idea-project-link">
              <Icon icon={Link2} />
              Есть проект
            </Link>
          )}
        </div>
      </div>
      <Cover photo={(catalogPreview.demoIdeaPhotos as Record<number, CatalogPhoto>)[idea.id]} />
    </article>
  )
}

export function TeamCard({ team }: { team: Item<"teams"> }) {
  const captain = person(team.captainId)
  return (
    <article className="team-entry">
      <Cover
        photo={(catalogPreview.demoTeamPhotos as Record<number, CatalogPhoto>)[team.id]}
        name={team.name}
      />
      <div className="team-entry-body">
        <div className="catalog-title-line">
          <h2 className="catalog-entry-title">
            <Link href={`/teams/${team.id}`}>{team.name}</Link>
          </h2>
          {team.captainId === 1 ? (
            <Tag tone="blue">Ты капитан</Tag>
          ) : (
            team.members.includes(1) && <Tag>Ты в команде</Tag>
          )}
        </div>
        <p className="catalog-excerpt">{team.description}</p>
        <Skills names={team.skills} />
      </div>
      <div className="team-roster">
        <div className="team-roster-count">
          <span className="people-stack">
            {team.members.slice(0, 3).map((id) => (
              <span key={id} className="avatar initials tiny">
                {initials(person(id).name)}
              </span>
            ))}
          </span>
          <span>{plural(team.members.length, "участник", "участника", "участников")}</span>
        </div>
        <p>
          Капитан <Link href={`/${captain.username}`}>{captain.name}</Link>
        </p>
      </div>
    </article>
  )
}

export function CommunityCard({ community }: { community: Item<"communities"> }) {
  const posts = catalogPreview.posts.filter((post) => post.communityId === community.id)
  return (
    <article className="community-card">
      <div className="community-card-summary">
        <Cover
          photo={(catalogPreview.demoCommunityPhotos as Record<number, CatalogPhoto>)[community.id]}
          name={community.name}
        />
        <div className="community-card-body">
          <div className="catalog-title-line">
            <h2 className="catalog-entry-title">
              <Link href={`/communities/${community.id}`}>{community.name}</Link>
            </h2>
            {community.members.includes(1) && (
              <Tag tone="blue">{community.creatorId === 1 ? "Ты создатель" : "Ты участник"}</Tag>
            )}
          </div>
          <p className="catalog-excerpt">{community.description}</p>
        </div>
      </div>
      <div className="community-card-meta">
        <span>
          <Icon icon={Users} />
          {plural(community.members.length, "участник", "участника", "участников")}
        </span>
        {posts.length > 0 && (
          <span>{plural(posts.length, "публикация", "публикации", "публикаций")}</span>
        )}
      </div>
      {posts[0] && (
        <Link
          href={`/communities/${community.id}/posts/${posts[0].id}`}
          className="community-discussion"
        >
          <Icon icon={MessageCircle} />
          <span>{posts[0].title}</span>
          <Icon icon={ArrowUpRight} />
        </Link>
      )}
    </article>
  )
}

const eventFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Moscow",
})
export function EventCard({ event }: { event: Item<"events"> }) {
  const past = eventIsPast(event)
  const date = new Date(event.startDate)
  const teams = catalogPreview.teams.filter((team) => team.eventIds.some((id) => id === event.id))
  return (
    <article className="event-row event-entry">
      <time className="date-tile" dateTime={event.startDate}>
        <span>
          {date
            .toLocaleDateString("ru-RU", { month: "short", timeZone: "Europe/Moscow" })
            .replace(".", "")}
        </span>
        <strong>
          {date.toLocaleDateString("ru-RU", { day: "numeric", timeZone: "Europe/Moscow" })}
        </strong>
      </time>
      <div className="entity-row-content">
        <div className="entity-row-title">
          <h2 className="catalog-entry-title">
            <Link href={`/events/${event.id}`} className="project-name">
              {event.name}
            </Link>
          </h2>
          <Tag tone={past ? "" : "blue"}>{past ? "Завершён" : "Хакатон"}</Tag>
        </div>
        <div className="event-metadata">
          <span>
            <Icon icon={Calendar} />
            {eventFormatter.formatRange(date, new Date(event.endDate)).replaceAll(/\s/g, " ")}
          </span>
          <span>
            <Icon icon={MapPin} />
            {event.location}
          </span>
        </div>
        <p className="catalog-excerpt">{event.description}</p>
        <div className="entity-row-footer">
          <Link href={`/events/${event.id}`}>
            {teams.length
              ? `${plural(teams.length, "команда", "команды", "команд")} на платформе`
              : past
                ? "Нет команд на платформе"
                : "Станьте первой командой"}
          </Link>
          {teams.some((team) => team.members.includes(1)) && (
            <Tag tone="blue">Участвует твоя команда</Tag>
          )}
        </div>
      </div>
      <Cover photo={(catalogPreview.demoEventPhotos as Record<number, CatalogPhoto>)[event.id]} />
    </article>
  )
}
