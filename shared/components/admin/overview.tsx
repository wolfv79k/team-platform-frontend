"use client"
import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  CalendarDays,
  FolderKanban,
  Lightbulb,
  RefreshCw,
  UsersRound,
  Workflow,
} from "lucide-react"
import { ProjectStatus } from "@/types/enums"
import { statusLabels } from "@/shared/lib/project-display"
import { apiErrorMessage } from "@/services/api-error"
import { useAdminCatalog } from "@/services/admin-catalog.api"
import { catalog, kinds, shortDate, int, type CatalogRow, type Kind } from "@/shared/lib/admin-catalog"

const icons = { projects: FolderKanban, ideas: Lightbulb, communities: UsersRound }
const dayMs = 86_400_000
const moscowOffset = 3 * 3_600_000
const dayNumber = (time: number) => Math.floor((time + moscowOffset) / dayMs)
type Bucket = Record<Kind, number>
function bucketDays(rows: CatalogRow[], days: number) {
  const today = dayNumber(Date.now())
  const first = today - days + 1
  const values: Bucket[] = Array.from({ length: days }, () => ({
    projects: 0,
    ideas: 0,
    communities: 0,
  }))
  for (const row of rows) {
    const index = dayNumber(Date.parse(row.createdAt)) - first
    if (index >= 0 && index < days) values[index][row.kind]++
  }
  return { first, values }
}

function ActivityChart({ buckets, first }: { buckets: Bucket[]; first: number }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [visible, setVisible] = useState<readonly Kind[]>(kinds)
  const index = selected === null ? null : Math.min(selected, buckets.length - 1)
  const peak = Math.max(1, ...buckets.flatMap((bucket) => visible.map((kind) => bucket[kind])))
  const step = Math.max(1, Math.ceil(peak / 4))
  const ceiling = Math.ceil(peak / step) * step
  const ticks = Array.from({ length: ceiling / step + 1 }, (_, i) => i * step)
  const x = (i: number) => 38 + (550 * i) / (buckets.length - 1)
  const y = (v: number) => 162 - (v / ceiling) * 144
  const label = (i: number) => shortDate((first + i) * dayMs)
  const total = buckets.reduce((acc, b) => acc + b.projects + b.ideas + b.communities, 0)
  return (
    <section className="adm-panel adm-trends">
      <div className="adm-flex">
        <div>
          <h2>Динамика публикаций</h2>
          <p>Новые записи по дням</p>
        </div>
        <CalendarDays size={17} />
      </div>
      <div className="adm-chart-summary">
        <strong>{int(total)}</strong>
        <span>за период</span>
      </div>
      <div className="adm-legend">
        {kinds.map((k) => (
          <button
            key={k}
            aria-pressed={visible.includes(k)}
            disabled={visible.length === 1 && visible[0] === k}
            onClick={() =>
              setVisible(visible.includes(k) ? visible.filter((kind) => kind !== k) : [...visible, k])
            }
          >
            <i style={{ background: catalog[k].color }} />
            {catalog[k].title}
          </button>
        ))}
      </div>
      <svg
        className="adm-chart"
        viewBox="0 0 604 194"
        role="img"
        aria-label={`Динамика публикаций. Всего за период: ${total}`}
        onPointerMove={(e) => {
          const svg = e.currentTarget
          const point = svg.createSVGPoint()
          point.x = e.clientX
          point.y = e.clientY
          const matrix = svg.getScreenCTM()
          if (matrix)
            setSelected(
              Math.max(
                0,
                Math.min(
                  buckets.length - 1,
                  Math.round(
                    ((point.matrixTransform(matrix.inverse()).x - 38) / 550) * (buckets.length - 1),
                  ),
                ),
              ),
            )
        }}
      >
        <defs>
          {kinds.map((k) => (
            <linearGradient key={k} id={`area-${k}`} x1="0" x2="0" y1="0" y2="1">
              <stop stopColor={catalog[k].color} stopOpacity=".24" />
              <stop offset="1" stopColor={catalog[k].color} stopOpacity=".015" />
            </linearGradient>
          ))}
        </defs>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1="38" x2="588" y1={y(tick)} y2={y(tick)} stroke="#293453" strokeDasharray="3 5" />
            <text x="26" y={y(tick) + 3} textAnchor="end">
              {int(tick)}
            </text>
          </g>
        ))}
        {visible.map((k) => {
          const path = buckets.map((b, i) => `${i ? "L" : "M"}${x(i)},${y(b[k])}`).join(" ")
          return (
            <g key={k}>
              <path d={`${path} L588,162 L38,162 Z`} fill={`url(#area-${k})`} />
              <path
                d={path}
                fill="none"
                stroke={catalog[k].color}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </g>
          )
        })}
        {[0, 1, 2, 3, 4].map((t) => {
          const i = Math.round(((buckets.length - 1) * t) / 4)
          return (
            <text key={t} x={x(i)} y="187" textAnchor={t === 4 ? "end" : t === 0 ? "start" : "middle"}>
              {label(i)}
            </text>
          )
        })}
        {index !== null && (
          <line x1={x(index)} x2={x(index)} y1="12" y2="162" stroke="#b6bed4" strokeDasharray="3 3" />
        )}
      </svg>
      <div className="adm-inspect">
        <select
          aria-label="День для просмотра"
          value={index ?? buckets.length - 1}
          onChange={(e) => setSelected(Number(e.target.value))}
        >
          {buckets.map((_, i) => (
            <option key={i} value={i}>
              {label(i)}
            </option>
          ))}
        </select>
        <span>
          {kinds
            .map((k) => `${catalog[k].title}: ${buckets[index ?? buckets.length - 1][k]}`)
            .join(" · ")}
        </span>
      </div>
    </section>
  )
}

export function Overview() {
  const projects = useAdminCatalog("projects")
  const ideas = useAdminCatalog("ideas")
  const communities = useAdminCatalog("communities")
  const queries = [projects, ideas, communities]
  const [days, setDays] = useState(30)
  const issue = queries.find((q) => q.isError)
  const loading = queries.some((q) => q.isPending)
  const refresh = () => Promise.all(queries.map((q) => q.refetch()))
  const data = {
    projects: projects.data ?? [],
    ideas: ideas.data ?? [],
    communities: communities.data ?? [],
  }
  const rows = kinds.flatMap((k) => data[k])
  const { first, values } = bucketDays(rows, days)
  const status = Object.values(ProjectStatus).map((value, i) => ({
    label: statusLabels[value],
    count: data.projects.filter((p) => p.status === value).length,
    color: ["#ce4aff", "#44caff", "#8288ff"][i],
  }))
  let arc = 0
  const gradient = status
    .map((item) => {
      const start = arc
      arc += (100 * item.count) / (data.projects.length || 1)
      return `${item.color} ${start}% ${arc}%`
    })
    .join(", ")
  const converted = data.ideas.filter((i) => i.converted).length
  const latest = [...rows]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id - a.id)
    .slice(0, 6)
  return (
    <>
      <div className="adm-heading">
        <div>
          <h1>Обзор платформы</h1>
          <p>Активность и развитие каталогов TeamPlatform</p>
        </div>
        <div className="adm-controls">
          <label className="adm-period">
            <CalendarDays size={16} />
            <select
              aria-label="Период аналитики"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              {[7, 30, 90].map((n) => (
                <option key={n} value={n}>
                  {n} дней
                </option>
              ))}
            </select>
          </label>
          <button
            className="adm-icon"
            disabled={queries.some((q) => q.isFetching)}
            onClick={refresh}
            aria-label="Обновить аналитику"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      {issue && (
        <p role="alert" className="adm-error">
          {apiErrorMessage(issue.error)} <button onClick={refresh}>Повторить</button>
        </p>
      )}
      {loading ? (
        <p className="adm-empty" role="status">
          Загрузка аналитики…
        </p>
      ) : (
        queries.every((q) => q.data) && (
          <>
            <div className="adm-kpis">
              {kinds.map((k) => {
                const Icon = icons[k]
                const added = values.reduce((sum, b) => sum + b[k], 0)
                return (
                  <Link key={k} className="adm-panel adm-kpi" href={`/admin/${k}`}>
                    <div className="adm-flex">
                      <span className="adm-kpi-icon" style={{ color: catalog[k].color }}>
                        <Icon size={16} />
                      </span>
                      <ArrowUpRight size={14} />
                    </div>
                    <span>{catalog[k].title}</span>
                    <div className="adm-metric">
                      <strong>{int(data[k].length)}</strong>
                      <small title={`Создано за ${days} дней`}>+{int(added)} за период</small>
                    </div>
                  </Link>
                )
              })}
              <div className="adm-panel adm-kpi">
                <div className="adm-kpi-icon mint">
                  <Workflow size={16} />
                </div>
                <span>Идеи с проектом</span>
                <div className="adm-metric">
                  <strong>
                    {data.ideas.length ? `${Math.round((100 * converted) / data.ideas.length)}%` : "—"}
                  </strong>
                  <small className="neutral">
                    {converted} из {data.ideas.length}
                  </small>
                </div>
              </div>
            </div>
            <div className="adm-analytics">
              <ActivityChart key={days} buckets={values} first={first} />
              <section className="adm-panel adm-status">
                <h2>Статусы проектов</h2>
                <p>Распределение по каталогу</p>
                <div
                  className="adm-ring"
                  style={{
                    background: data.projects.length
                      ? `conic-gradient(from -90deg, ${gradient})`
                      : "#253253",
                  }}
                >
                  <div>
                    <strong>{int(data.projects.length)}</strong>
                    <span>всего проектов</span>
                  </div>
                </div>
                <div className="adm-status-list">
                  {status.map((item) => (
                    <div key={item.label}>
                      <span>
                        <i style={{ background: item.color }} />
                        {item.label}
                      </span>
                      <strong>{int(item.count)}</strong>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <section className="adm-panel adm-recent">
              <div className="adm-flex">
                <h2>Последние публикации</h2>
                <span className="adm-muted">По дате создания</span>
              </div>
              {latest.length ? (
                <div className="adm-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Название</th>
                        <th>Раздел</th>
                        <th>Автор</th>
                        <th>Создано</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latest.map((row) => {
                        const Icon = icons[row.kind]
                        return (
                          <tr key={row.kind + row.id}>
                            <td>
                              <Link href={`/${row.kind}/${row.id}`}>
                                <Icon size={15} style={{ color: catalog[row.kind].color }} />
                                {row.name}
                              </Link>
                            </td>
                            <td>{catalog[row.kind].single}</td>
                            <td>@{row.username}</td>
                            <td>{shortDate(row.createdAt)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="adm-empty">Публикаций пока нет.</p>
              )}
            </section>
          </>
        )
      )}
    </>
  )
}
