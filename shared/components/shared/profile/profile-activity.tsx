import {
  Activity,
  Boxes,
  Building2,
  FileText,
  Lightbulb,
  MessageSquare,
  Users,
  UsersRound,
} from "lucide-react"
import type {
  ProfileActivity as ActivityFeed,
  ProfileActivityItem,
} from "@/shared/lib/profile-activity"

const kinds = new Map([
  ["post", { icon: FileText, label: "Публикация" }],
  ["comment", { icon: MessageSquare, label: "Комментарий" }],
  ["project_created", { icon: Boxes, label: "Создание проекта" }],
  ["project_joined", { icon: Boxes, label: "Вступление в проект", undated: "Участие в проекте" }],
  ["idea", { icon: Lightbulb, label: "Новая идея" }],
  ["team_created", { icon: UsersRound, label: "Создание команды" }],
  [
    "team_joined",
    { icon: UsersRound, label: "Вступление в команду", undated: "Участие в команде" },
  ],
  ["community_created", { icon: Building2, label: "Создание сообщества" }],
  [
    "community_joined",
    { icon: Users, label: "Вступление в сообщество", undated: "Участие в сообществе" },
  ],
])
const dateFormat = new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeZone: "UTC" })

function ActivityEntry({ item }: { item: ProfileActivityItem }) {
  const kind = kinds.get(item.type)
  const Icon = kind?.icon ?? Activity
  const date = item.occurredAt ? Date.parse(item.occurredAt) : NaN
  const hasDate = Number.isFinite(date)
  const label = (hasDate ? kind?.label : (kind?.undated ?? kind?.label)) ?? "Активность"

  return (
    <li className="relative flex gap-3 border-t border-border/70 py-4">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon size={16} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-semibold [overflow-wrap:anywhere]">{item.title}</p>
        {item.detail && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground [overflow-wrap:anywhere]">
            {item.detail}
          </p>
        )}
        {hasDate && (
          <time
            dateTime={item.occurredAt ?? undefined}
            className="mt-1.5 block text-xs text-muted-foreground"
          >
            {dateFormat.format(date)}
          </time>
        )}
      </div>
    </li>
  )
}

export default function ProfileActivity({ feed }: { feed: ActivityFeed }) {
  return (
    <aside
      aria-labelledby="profile-activity-heading"
      className="min-w-0 shrink-0 border-t px-5 py-6 sm:px-8 lg:w-72 lg:border-t-0 lg:border-l lg:px-5 xl:w-80"
    >
      <h2 id="profile-activity-heading" className="text-base font-semibold">
        Последняя активность
      </h2>
      {feed.items.length > 0 ? (
        <ol className="mt-4">
          {feed.items.map((item) => (
            <ActivityEntry key={item.id} item={item} />
          ))}
        </ol>
      ) : (
        feed.complete && (
          <p className="mt-3 text-sm text-muted-foreground">Публичной активности пока нет.</p>
        )
      )}
      {!feed.complete && (
        <p className="mt-3 text-sm text-muted-foreground">
          {feed.items.length
            ? "Показаны только проекты. Остальная активность пока недоступна."
            : "Лента активности пока недоступна."}
        </p>
      )}
    </aside>
  )
}
