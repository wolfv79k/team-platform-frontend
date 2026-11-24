"use client"
import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { saveAdminRecord } from "@/app/admin/actions"
import { catalog, type Kind, type CatalogRow } from "@/shared/lib/admin-catalog"
import { useRoles } from "@/shared/lib/project-queries"
import { statusLabels } from "@/shared/lib/project-display"
import { Button } from "@/shared/components/ui/button"

export type Editor = { operation: "create" } | { operation: "edit" | "delete"; row: CatalogRow }
export function RecordDialog({
  kind,
  editor,
  close,
  saved,
}: {
  kind: Kind
  editor: Editor
  close: () => void
  saved: (message: string) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const client = useQueryClient()
  const { operation } = editor
  const row = "row" in editor ? editor.row : undefined
  const chooseRole = kind === "projects" && operation === "create"
  const roles = useRoles(chooseRole)
  useEffect(() => {
    const element = dialog.current!
    element.showModal()
    return () => element.close()
  }, [])
  const title =
    operation === "create"
      ? catalog[kind].add
      : operation === "edit"
        ? "Редактирование записи"
        : "Удалить запись?"
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (lock.current) return
    const form = new FormData(event.currentTarget)
    lock.current = true
    setBusy(true)
    setError("")
    try {
      const result = await saveAdminRecord(kind, operation, row?.id ?? null, form)
      if (result.error) {
        setError(result.error)
        return
      }
      await client.invalidateQueries({ queryKey: ["admin-catalog", kind] })
      saved(operation === "delete" ? "Запись удалена." : "Изменения сохранены.")
    } catch {
      setError("Не удалось подтвердить результат. Обновите таблицу перед повтором.")
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  return (
    <dialog
      className="adm-dialog"
      ref={dialog}
      aria-labelledby="adm-dialog-title"
      onCancel={(e) => {
        e.preventDefault()
        if (!busy) close()
      }}
    >
      <form onSubmit={submit}>
        <div className="adm-flex">
          <h2 id="adm-dialog-title">{title}</h2>
          <button
            type="button"
            className="adm-icon"
            aria-label="Закрыть"
            onClick={close}
            disabled={busy}
          >
            <X size={18} />
          </button>
        </div>
        {operation === "delete" ? (
          <p>«{row?.name}» будет удалена с платформы. Восстановить запись через панель нельзя.</p>
        ) : (
          <>
            <label>
              Название
              <input name="name" required maxLength={100} defaultValue={row?.name} autoFocus />
            </label>
            <label>
              Описание
              <textarea name="description" rows={4} defaultValue={row?.description ?? ""} />
            </label>
            {chooseRole && (
              <label>
                Роль автора
                <select name="roleId" defaultValue="" required>
                  <option value="" disabled>
                    Выберите роль
                  </option>
                  {roles.data?.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {chooseRole && roles.isError && (
              <button type="button" className="adm-btn" onClick={() => roles.refetch()}>
                Повторить загрузку ролей
              </button>
            )}
            {row?.status && (
              <label>
                Статус
                <select name="status" defaultValue={row.status}>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}
        {error && (
          <p role="alert" className="adm-error">
            {error}
          </p>
        )}
        <footer>
          <Button type="button" className="adm-btn" onClick={close} disabled={busy}>
            Отмена
          </Button>
          <Button
            type="submit"
            className={`adm-btn ${operation === "delete" ? "danger" : "primary"}`}
            disabled={busy || (chooseRole && !roles.data?.length)}
          >
            {busy ? "Подождите…" : operation === "delete" ? "Удалить" : "Сохранить"}
          </Button>
        </footer>
      </form>
    </dialog>
  )
}
