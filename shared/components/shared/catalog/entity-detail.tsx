import Link from "next/link"
import { ArrowUpRight, Calendar, MapPin, MessageCircle } from "lucide-react"
import { notFound } from "next/navigation"
import { catalogPreview } from "@/shared/data/catalog-preview"
import { Icon } from "@/shared/components/ui/icon"
import { person, plural } from "@/shared/lib/catalog-preview"
import { PhotoCover } from "./catalog-media"
import { Skills, Tag } from "./catalog-tags"
import { BrowseLayout } from "@/shared/components/shared/layout/browse-layout"
import EntityTabs from "./entity-tabs"
import { catalogs, type CatalogKind } from "@/shared/lib/catalog-config"

const photoMaps = {
  projects: catalogPreview.demoProjectPhotos,
  ideas: catalogPreview.demoIdeaPhotos,
  teams: catalogPreview.demoTeamPhotos,
  communities: catalogPreview.demoCommunityPhotos,
  events: catalogPreview.demoEventPhotos,
}
const entityNames = {
  projects: "проекте",
  ideas: "идее",
  teams: "команде",
  communities: "сообществе",
  events: "событии",
}

export default function EntityDetail({ kind, id }: { kind: CatalogKind; id: number }) {
  const item = catalogPreview[kind].find((item) => item.id === id)
  if (!item) notFound()
  const photo = (photoMaps[kind] as Record<number, (typeof catalogPreview.photos)["home"]>)[id]
  const communityPosts =
    kind === "communities" ? catalogPreview.posts.filter((post) => post.communityId === id) : []
  const people = "members" in item ? item.members : []
  const skills = "skills" in item ? item.skills : []
  const relatedTeams =
    kind === "events"
      ? catalogPreview.teams.filter((team) => team.eventIds.some((event) => event === id))
      : []
  const dateFormat = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Moscow",
  })

  if (kind === "teams" || kind === "communities") {
    const team = catalogPreview.teams.find((team) => team.id === id)
    const isTeam = kind === "teams"
    const member = people.includes(1)
    const heading = isTeam ? "Команды" : "Сообщества"
    const memberList = (
      <section className="entity-section">
        <h2>
          Участники <span className="count">{people.length}</span>
        </h2>
        {people.map((memberId) => (
          <MemberLink key={memberId} id={memberId} />
        ))}
      </section>
    )
    const about = (
      <>
        <section className="entity-section">
          <h2>О {entityNames[kind]}</h2>
          <p className="reading preserve-lines">{item.description}</p>
        </section>
        {team && (
          <>
            <section className="entity-section">
              <h2>Технологии команды</h2>
              <div className="skill-level-list">
                {team.skills.map((skill) => (
                  <span key={skill}>
                    <Tag>{skill}</Tag>
                    <small>
                      {(team.levels as Record<string, string | undefined>)[skill] ?? "Начальный"}
                    </small>
                  </span>
                ))}
              </div>
            </section>
            <section className="entity-section">
              <h2>Капитан команды</h2>
              <MemberLink id={team.captainId} />
            </section>
            {member && (
              <section className="contribution">
                <h3>Мой вклад в команду</h3>
                <p>{(team.contributions as Record<number, string | undefined>)[1]}</p>
              </section>
            )}
          </>
        )}
      </>
    )
    const tabs = team
      ? [
          { title: "О команде", content: about },
          { title: "Участники " + people.length, content: memberList },
          {
            title: "События",
            content: (
              <section className="entity-section">
                <h2>Участие в событиях</h2>
                {catalogPreview.events
                  .filter((event) => team.eventIds.some((eventId) => eventId === event.id))
                  .map((event) => (
                    <p key={event.id}>
                      <Link href={"/events/" + event.id}>{event.name}</Link>
                    </p>
                  ))}
              </section>
            ),
          },
          ...(team.captainId === 1
            ? [
                {
                  title:
                    "Заявки " +
                    catalogPreview.teamApplications.filter(
                      (entry) => entry.teamId === team.id && entry.type === "REQUEST",
                    ).length,
                  content: (
                    <section className="entity-section">
                      <h2>Заявки в команду</h2>
                      {catalogPreview.teamApplications
                        .filter((entry) => entry.teamId === team.id && entry.type === "REQUEST")
                        .map((entry) => (
                          <p key={entry.id} className="reading">
                            {entry.message}
                          </p>
                        ))}
                    </section>
                  ),
                },
              ]
            : []),
        ]
      : [
          {
            title: "Публикации",
            content: (
              <section className="entity-section">
                <div className="section-heading">
                  <h2>Публикации</h2>
                  {member && (
                    <Link href={"/communities/" + id + "/posts/new"} className="btn primary">
                      Новая публикация
                    </Link>
                  )}
                </div>
                {communityPosts.map((post) => (
                  <article key={post.id} className="post-card">
                    <h3>
                      <Link href={"/communities/" + id + "/posts/" + post.id}>{post.title}</Link>
                    </h3>
                    <p className="reading">{post.text}</p>
                  </article>
                ))}
              </section>
            ),
          },
          { title: "О сообществе", content: about },
          { title: "Участники", content: memberList },
        ]
    return (
      <BrowseLayout title={heading + " › " + item.name} back={"/" + kind}>
        <article className="entity-detail">
          <div className="entity-heading">
            <span className={"entity-mark " + (isTeam ? "team" : "community")}>
              {item.name
                .split(/\s+/)
                .slice(0, 2)
                .map((word) => word[0])
                .join("")}
            </span>
            <div>
              <h1>{item.name}</h1>
              <p>{plural(people.length, "участник", "участника", "участников")}</p>
            </div>
            <div className="entity-actions">
              {team?.captainId === 1 ? (
                <Link className="btn secondary" href={"/teams/" + id + "/edit"}>
                  Редактировать
                </Link>
              ) : member ? (
                <Tag tone="blue">{isTeam ? "Ты в команде" : "Ты участник"}</Tag>
              ) : (
                <button className="btn primary" type="button" disabled>
                  {isTeam ? "Подать заявку" : "Вступить"}
                </button>
              )}
            </div>
          </div>
          {!isTeam && <p className="entity-intro">{item.description}</p>}
          {photo && (
            <figure className="wide-photo catalog-detail-photo">
              <PhotoCover photo={photo} decorative={false} />
            </figure>
          )}
          <EntityTabs label={isTeam ? "Разделы команды" : "Разделы сообщества"} tabs={tabs} />
        </article>
      </BrowseLayout>
    )
  }

  return (
    <BrowseLayout title={`${catalogs[kind].title} › ${item.name}`} back={`/${kind}`}>
      <article
        className={`entity-detail ${kind === "events" ? "event-detail" : kind === "ideas" ? "idea-detail" : ""}`}
      >
        <div className="entity-heading">
          <div>
            {"status" in item && (
              <Tag tone={item.status === "Набор в команду" ? "blue" : "green"}>{item.status}</Tag>
            )}
            <h1>{item.name}</h1>
            {"slogan" in item && <p className="reading">{item.slogan}</p>}
            {"location" in item && (
              <div className="event-metadata">
                <span>
                  <Icon icon={Calendar} />
                  {dateFormat.formatRange(new Date(item.startDate), new Date(item.endDate))}
                </span>
                <span>
                  <Icon icon={MapPin} />
                  {item.location}
                </span>
              </div>
            )}
            {"authorId" in item && (
              <div className="idea-byline">
                <Link href={`/${person(item.authorId).username}`}>
                  {person(item.authorId).name}
                </Link>
                <time dateTime={item.createdAt}>{dateFormat.format(new Date(item.createdAt))}</time>
              </div>
            )}
          </div>
          {"authorId" in item && item.authorId === 1 && (
            <div className="entity-actions">
              <Link href={"/ideas/" + item.id + "/edit"} className="btn secondary small">
                Редактировать
              </Link>
            </div>
          )}
        </div>
        {photo && (
          <figure
            className={`wide-photo ${kind === "events" ? "event-photo" : "project-detail-photo"}`}
          >
            <PhotoCover photo={photo} decorative={false} />
            {kind === "events" && <figcaption>Тематическое фото</figcaption>}
          </figure>
        )}
        <section className="entity-section">
          <h2>О {entityNames[kind]}</h2>
          <p className="reading">{item.description}</p>
        </section>
        {skills.length > 0 && (
          <section className="entity-section">
            <h2>Технологии</h2>
            <Skills names={skills} />
          </section>
        )}
        {people.length > 0 && (
          <section className="entity-section">
            <h2>
              Участники <span className="count">{people.length}</span>
            </h2>
            <ul>
              {people.map((id) => (
                <li key={id}>
                  <Link className="text-link" href={`/${person(id).username}`}>
                    {person(id).name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {communityPosts.length > 0 && (
          <section className="entity-section">
            <h2>Публикации</h2>
            {communityPosts.map((post) => (
              <article key={post.id} className="post-card">
                <h3>
                  <Link href={`/communities/${id}/posts/${post.id}`}>{post.title}</Link>
                </h3>
                <p className="reading">{post.text}</p>
              </article>
            ))}
          </section>
        )}
        {relatedTeams.length > 0 && (
          <section className="entity-section">
            <h2>Команды на платформе</h2>
            {relatedTeams.map((team) => (
              <p key={team.id}>
                <Link className="text-link" href={`/teams/${team.id}`}>
                  {team.name}
                </Link>
              </p>
            ))}
          </section>
        )}
        {"projectId" in item && item.projectId && (
          <section className="idea-relation">
            <div>
              <h2>Проект по идее</h2>
              <p>
                {catalogPreview.projects.find((project) => project.id === item.projectId)?.name}
              </p>
            </div>
            <Link href={`/projects/${item.projectId}`} className="btn secondary">
              Открыть проект
              <Icon icon={ArrowUpRight} />
            </Link>
          </section>
        )}
        {"organizerUrl" in item && (
          <a href={item.organizerUrl} className="btn secondary">
            Сайт организатора
            <Icon icon={ArrowUpRight} />
          </a>
        )}
      </article>
    </BrowseLayout>
  )
}

function MemberLink({ id }: { id: number }) {
  const account = person(id)
  const initials = account.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
  return (
    <div className="member-entry">
      <Link href={id === 1 ? "/user" : "/" + account.username} className="member">
        <span className="avatar initials small">{initials}</span>
        <span>
          <strong>{account.name}</strong>
          <small>@{account.username}</small>
        </span>
        <Icon icon={ArrowUpRight} />
      </Link>
    </div>
  )
}

export function PostDetail({ communityId, postId }: { communityId: number; postId: number }) {
  const post = catalogPreview.posts.find(
    (post) => post.id === postId && post.communityId === communityId,
  )
  if (!post) notFound()
  const author = person(post.authorId)
  const comments = catalogPreview.comments.filter((comment) => comment.postId === postId)
  return (
    <BrowseLayout title="Публикация" back={`/communities/${communityId}`}>
      <article className="entity-detail">
        <h1>{post.title}</h1>
        <div className="idea-byline">
          <Link href={`/${author.username}`}>{author.name}</Link>
          <span>{post.created}</span>
        </div>
        <p className="reading mt-5 whitespace-pre-wrap">{post.text}</p>
        <section className="entity-section">
          <h2>
            <Icon icon={MessageCircle} /> Комментарии
          </h2>
          {comments.map((comment) => (
            <article key={comment.id} className="post-card">
              <h3>{person(comment.authorId).name}</h3>
              <p className="reading">{comment.text}</p>
            </article>
          ))}
        </section>
      </article>
    </BrowseLayout>
  )
}
