"use client"

import "@/app/styles/github-profile.css"
import Image from "next/image"
import type { CSSProperties } from "react"
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CircleDot,
  GitCommitHorizontal,
  GitFork,
  GitPullRequest,
  MessageSquare,
  Package,
  Plus,
  Star,
  type LucideIcon,
} from "lucide-react"
import { apiErrorMessage } from "@/services/api-error"
import { githubProfileUrl } from "@/shared/lib/github-profile"
import { useGithubProfile } from "@/shared/lib/github-queries"
import { plural } from "@/shared/lib/catalog-preview"
import type {
  GitHubActivityEvent,
  GitHubConnection,
  GitHubContributionCalendar,
  GitHubPublicProfile,
  GitHubRepository,
} from "@/types/github"

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Moscow",
})
const eventDateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  timeZone: "Europe/Moscow",
})
const numberFormat = new Intl.NumberFormat("ru-RU")
const pluralRules = new Intl.PluralRules("ru-RU")
const monthFormat = new Intl.DateTimeFormat("ru-RU", { month: "short", timeZone: "UTC" })
const dayDateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})
const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#e8c430",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#a86bc3",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#718096",
  Rust: "#dea584",
  Go: "#00add8",
  Shell: "#89a651",
}

function eventDetails(event: GitHubActivityEvent): { label: string; Icon: LucideIcon } {
  switch (event.type) {
    case "PushEvent":
      return { label: "Обновил код", Icon: GitCommitHorizontal }
    case "PullRequestEvent":
      return {
        label: event.action === "closed" ? "Закрыл pull request" : "Работал с pull request",
        Icon: GitPullRequest,
      }
    case "PullRequestReviewEvent":
      return { label: "Проверил pull request", Icon: GitPullRequest }
    case "IssuesEvent":
      return { label: "Работал с issue", Icon: CircleDot }
    case "IssueCommentEvent":
      return { label: "Оставил комментарий", Icon: MessageSquare }
    case "CreateEvent":
      return { label: "Создал ветку, тег или репозиторий", Icon: Plus }
    case "ForkEvent":
      return { label: "Сделал форк", Icon: GitFork }
    case "WatchEvent":
      return { label: "Поставил звезду", Icon: Star }
    case "ReleaseEvent":
      return { label: "Выпустил релиз", Icon: Package }
    default:
      return { label: "Активность", Icon: Activity }
  }
}

function RepositoryCard({ repository }: { repository: GitHubRepository }) {
  return (
    <a
      className="github-repository"
      href={repository.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="github-repository-title">
        <BookOpen size={16} />
        <strong>{repository.name}</strong>
        <ArrowUpRight size={15} className="github-repository-arrow" />
      </span>
      {repository.description && (
        <p className="github-repository-description">{repository.description}</p>
      )}
      <span className="github-repository-meta">
        {repository.language && (
          <span>
            <i
              className="github-language-dot"
              style={{ backgroundColor: languageColors[repository.language] ?? "#8693a5" }}
            />
            {repository.language}
          </span>
        )}
        <span aria-label={`${repository.stars} звёзд`}>
          <Star size={13} />
          {numberFormat.format(repository.stars)}
        </span>
        <span aria-label={`${repository.forks} форков`}>
          <GitFork size={13} />
          {numberFormat.format(repository.forks)}
        </span>
        {repository.fork && <span className="github-meta-badge">Форк</span>}
        {repository.archived && <span className="github-meta-badge">Архив</span>}
      </span>
      {repository.pushedAt && Number.isFinite(Date.parse(repository.pushedAt)) && (
        <time className="github-description" dateTime={repository.pushedAt}>
          Обновлён {dateFormat.format(new Date(repository.pushedAt))}
        </time>
      )}
    </a>
  )
}

function Languages({ repositories }: { repositories: GitHubRepository[] }) {
  const counts = new Map<string, number>()
  repositories.forEach(({ language }) => {
    if (language) counts.set(language, (counts.get(language) ?? 0) + 1)
  })
  if (!counts.size) return null
  const languages = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return (
    <div className="github-languages">
      <h4>Языки последних репозиториев</h4>
      <div className="github-language-bar" aria-hidden="true">
        {languages.map(([name, count]) => (
          <span
            key={name}
            style={{ flex: count, backgroundColor: languageColors[name] ?? "#8693a5" }}
          />
        ))}
      </div>
      <div className="github-language-legend">
        {languages.map(([name, count]) => (
          <span key={name}>
            <i
              className="github-language-dot"
              style={{ backgroundColor: languageColors[name] ?? "#8693a5" }}
            />
            {name}
            <small>{count}</small>
          </span>
        ))}
      </div>
    </div>
  )
}

function ContributionCalendar({ calendar }: { calendar: GitHubContributionCalendar }) {
  const { days, total } = calendar
  const firstDay = new Date(`${days[0].date}T00:00:00Z`)
  const offset = firstDay.getUTCDay()
  const weeks = Math.ceil((offset + days.length) / 7)
  const active = days.filter((day) => day.count > 0).length
  const monthLabels = new Map<number, string>()
  days.forEach((day, index) => {
    const date = new Date(`${day.date}T00:00:00Z`)
    const column = Math.floor((offset + index) / 7) + 1
    if (index === 0 || date.getUTCDate() === 1) {
      monthLabels.set(column, monthFormat.format(date).replace(".", ""))
    }
  })
  const labels = [...monthLabels]
  const visibleLabels = labels.filter(
    ([column], index) => index === labels.length - 1 || labels[index + 1][0] - column >= 3,
  )
  const form = pluralRules.select(total)
  const contributionLabel = form === "one" ? "вклад" : form === "few" ? "вклада" : "вкладов"
  const layout = { "--weeks": weeks } as CSSProperties
  return (
    <section className="github-activity-card">
      <div className="github-section-heading">
        <h3>Активность GitHub</h3>
        <span className="github-description">Последний год</span>
      </div>
      <div className="github-activity-summary">
        <strong>{numberFormat.format(total)}</strong> {contributionLabel} <span>·</span>{" "}
        {plural(active, "активный день", "активных дня", "активных дней")}
      </div>
      <div className="github-calendar-scroll" tabIndex={0} aria-label="Календарь активности GitHub">
        <div
          className="github-calendar"
          style={layout}
          role="img"
          aria-label={`Вклады за последний год: ${total}, ${active} активных дней`}
        >
          <div className="github-calendar-months" aria-hidden="true">
            {visibleLabels.map(([column, label]) => (
              <span key={column} style={{ gridColumn: column }}>
                {label}
              </span>
            ))}
          </div>
          <div className="github-calendar-weekdays" aria-hidden="true">
            <span>Пн</span>
            <span>Ср</span>
            <span>Пт</span>
          </div>
          <div className="github-heatmap" aria-hidden="true">
            {days.map(({ date, count, level }, index) => (
              <span
                key={date}
                style={{
                  gridColumn: Math.floor((offset + index) / 7) + 1,
                  gridRow: ((offset + index) % 7) + 1,
                }}
                data-level={level}
                title={`${dayDateFormat.format(new Date(`${date}T00:00:00Z`))}: ${plural(count, "вклад", "вклада", "вкладов")}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="github-heatmap-footer">
        <span>
          {dayDateFormat.format(firstDay)} —{" "}
          {dayDateFormat.format(new Date(`${days[days.length - 1].date}T00:00:00Z`))}
        </span>
        <span>
          Меньше <i data-level="0" />
          <i data-level="1" />
          <i data-level="2" />
          <i data-level="3" />
          <i data-level="4" /> Больше
        </span>
      </div>
    </section>
  )
}

function RecentActivity({ events }: { events: GitHubActivityEvent[] }) {
  return (
    <section className="github-activity-card">
      <div className="github-section-heading">
        <h3>Последние события</h3>
        <span className="github-description">30 дней</span>
      </div>
      {events.length ? (
        <ol className="github-event-list">
          {events.slice(0, 6).map((event) => {
            const { label, Icon } = eventDetails(event)
            return (
              <li key={event.id}>
                <span className="github-event-icon">
                  <Icon size={16} />
                </span>
                <div>
                  <strong>{label}</strong>
                  <a
                    className="github-link"
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {event.repository}
                  </a>
                </div>
                <time dateTime={event.createdAt}>
                  {eventDateFormat.format(new Date(event.createdAt))}
                </time>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="github-empty">За последние 30 дней нет доступных публичных событий.</p>
      )}
    </section>
  )
}

function GithubContent({ profile, retry }: { profile: GitHubPublicProfile; retry: () => void }) {
  return (
    <>
      <dl className="github-stats">
        {[
          { value: profile.publicRepos, label: "Репозитории" },
          { value: profile.followers, label: "Подписчики" },
          { value: profile.following, label: "Подписки" },
        ].map(({ value, label }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{numberFormat.format(value)}</dd>
          </div>
        ))}
      </dl>
      {profile.contributions ? (
        <ContributionCalendar calendar={profile.contributions} />
      ) : (
        <section className="github-activity-card">
          <h3>Активность GitHub</h3>
          <p className="github-empty">
            {profile.warnings.contributions}{" "}
            <button type="button" className="github-link" onClick={retry}>
              Повторить
            </button>
          </p>
        </section>
      )}
      <section className="github-subsection">
        <div className="github-section-heading">
          <h3>Последние репозитории</h3>
          <a
            className="github-link"
            href={`${profile.profileUrl}?tab=repositories`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Все репозитории <ArrowUpRight size={13} />
          </a>
        </div>
        {profile.repositories === null ? (
          <p className="github-empty">
            {profile.warnings.repositories}{" "}
            <button type="button" className="github-link" onClick={retry}>
              Повторить
            </button>
          </p>
        ) : profile.repositories.length ? (
          <>
            <div className="github-repositories">
              {profile.repositories.map((repository) => (
                <RepositoryCard key={repository.id} repository={repository} />
              ))}
            </div>
            <Languages repositories={profile.repositories} />
          </>
        ) : (
          <p className="github-empty">Публичных репозиториев пока нет.</p>
        )}
      </section>
      {profile.events === null ? (
        <section className="github-activity-card">
          <h3>Последние события</h3>
          <p className="github-empty">
            {profile.warnings.events}{" "}
            <button type="button" className="github-link" onClick={retry}>
              Повторить
            </button>
          </p>
        </section>
      ) : (
        <RecentActivity events={profile.events} />
      )}
    </>
  )
}

export default function GithubPortfolio({ connection }: { connection: GitHubConnection | null }) {
  const username = connection?.login ?? null
  const query = useGithubProfile(username)
  if (!username || !connection) return null
  if (query.data && query.data.id !== connection.id)
    return <p className="github-empty mt-4">Аккаунт GitHub изменился. Подключите его снова.</p>
  return (
    <section className="github-portfolio" aria-label="GitHub портфолио">
      <header className="github-portfolio-header">
        <div className="github-portfolio-identity">
          <span className="github-portfolio-logo">
            <Image
              src="/GitHub.svg"
              width={16}
              height={17}
              alt=""
              className="dark:invert"
              style={{ width: "auto", height: 23 }}
            />
          </span>
          <div>
            <h2>GitHub</h2>
            <span>@{query.data?.login ?? username}</span>
          </div>
        </div>
        <a
          className="github-profile-link"
          href={query.data?.profileUrl ?? githubProfileUrl(username)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Открыть GitHub <ArrowUpRight size={14} />
        </a>
      </header>
      {query.isPending ? (
        <div className="github-empty" role="status">
          Загружаем репозитории и активность…
        </div>
      ) : query.isError ? (
        <div className="github-empty" role="alert">
          {apiErrorMessage(query.error)}{" "}
          <button type="button" className="github-link" onClick={() => query.refetch()}>
            Повторить
          </button>
        </div>
      ) : (
        <GithubContent
          profile={query.data}
          retry={() => {
            void query.refetch()
          }}
        />
      )}
    </section>
  )
}
