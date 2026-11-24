"use client"
import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  LockKeyhole,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useAdminCatalog } from "@/services/admin-catalog.api"
import { apiErrorMessage } from "@/services/api-error"
import { catalog, shortDate, detailLabel, type Kind, int } from "@/shared/lib/admin-catalog"
import { RecordDialog, type Editor } from "./record-dialog"

export function CatalogTable({ kind, viewerId }: { kind: Kind; viewerId: number }) {
  const query = useAdminCatalog(kind)
  const [search, setSearch] = useState("")
  const [mine, setMine] = useState(false)
  const [page, setPage] = useState(1)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [notice, setNotice] = useState("")
  const rows = query.data ?? []
  const term = search.trim().toLocaleLowerCase("ru")
  const filtered = rows.filter(
    (row) =>
      (!mine || row.ownerId === viewerId) &&
      [row.name, row.username, String(row.id)].some((value) =>
        value.toLocaleLowerCase("ru").includes(term),
      ),
  )
  const pages = Math.max(1, Math.ceil(filtered.length / 15))
  const current = Math.min(page, pages)
  return (
    <>
      <div className="adm-heading">
        <div>
          <h1>{catalog[kind].title}</h1>
          <p>Управление записями каталога</p>
        </div>
        <button
          className="adm-btn primary"
          onClick={() => {
            setNotice("")
            setEditor({ operation: "create" })
          }}
        >
          <Plus size={16} />
          {catalog[kind].add}
        </button>
      </div>
      <section className="adm-panel adm-list">
        <div className="adm-toolbar">
          <div className="adm-tabs">
            <button
              aria-pressed={!mine}
              onClick={() => {
                setMine(false)
                setPage(1)
              }}
            >
              Все записи
            </button>
            <button
              aria-pressed={mine}
              onClick={() => {
                setMine(true)
                setPage(1)
              }}
            >
              Мои записи
            </button>
          </div>
          <label className="adm-search">
            <Search size={16} />
            <input
              type="search"
              aria-label="Поиск по названию, автору или ID"
              placeholder="Название, автор или ID"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </label>
          <button
            className="adm-icon"
            aria-label="Обновить таблицу"
            disabled={query.isFetching}
            onClick={() => query.refetch()}
          >
            <RefreshCw size={16} />
          </button>
        </div>
        {notice && (
          <p role="status" className="adm-note">
            {notice}
          </p>
        )}
        {query.isError && (
          <p role="alert" className="adm-error">
            {apiErrorMessage(query.error)}
          </p>
        )}
        {query.isPending ? (
          <p className="adm-empty" role="status">
            Загрузка записей…
          </p>
        ) : (
          query.data && (
            <>
              <div className="adm-scroll">
                <table>
                  <thead>
                    <tr>
                      {[
                        "Название",
                        "Автор",
                        "Дата создания",
                        kind === "communities" ? "Состав" : "Статус",
                        "Действия",
                      ].map((label) => (
                        <th key={label}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice((current - 1) * 15, current * 15).map((row) => (
                      <tr key={row.id}>
                        <td>
                          <Link href={`/${kind}/${row.id}`}>{row.name}</Link>
                          <small>#{row.id}</small>
                        </td>
                        <td>@{row.username}</td>
                        <td>
                          {shortDate(row.createdAt, true)}
                        </td>
                        <td>
                          <span className="adm-pill">{detailLabel(row)}</span>
                        </td>
                        <td>
                          {row.ownerId === viewerId ? (
                            <div className="adm-controls">
                              <button
                                className="adm-icon"
                                aria-label={`Редактировать ${row.name}`}
                                onClick={() => setEditor({ operation: "edit", row })}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                className="adm-icon"
                                aria-label={`Удалить ${row.name}`}
                                onClick={() => setEditor({ operation: "delete", row })}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ) : (
                            <span
                              className="adm-readonly"
                              title="Изменять запись может только её владелец"
                            >
                              <LockKeyhole size={13} /> Просмотр
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!filtered.length && (
                <p className="adm-empty">
                  {rows.length ? "По вашему запросу ничего не найдено." : "В каталоге пока нет записей."}
                </p>
              )}
              <div className="adm-pager">
                <span>Найдено записей · {int(filtered.length)}</span>
                <div>
                  <button
                    className="adm-icon"
                    aria-label="Предыдущая страница"
                    disabled={current <= 1}
                    onClick={() => setPage(current - 1)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {current} / {pages}
                  <button
                    className="adm-icon"
                    aria-label="Следующая страница"
                    disabled={current >= pages}
                    onClick={() => setPage(current + 1)}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )
        )}
      </section>
      {editor && (
        <RecordDialog
          kind={kind}
          editor={editor}
          close={() => setEditor(null)}
          saved={(message) => {
            setNotice(message)
            setEditor(null)
          }}
        />
      )}
    </>
  )
}
