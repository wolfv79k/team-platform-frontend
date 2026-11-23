"use client"

import "@/app/styles/github-profile.css"
import { useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Dialog } from "@base-ui/react/dialog"
import { Check, Plus, X, RotateCw } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { disconnectGithub } from "@/app/actions/profile"
import { githubUsername } from "@/shared/lib/github-profile"

const statusMessages: Record<string, string> = {
  connected: "Аккаунт GitHub подключён.",
  denied: "Подключение GitHub отменено.",
  expired: "Сессия подключения истекла. Попробуй ещё раз.",
  error: "Не удалось подключить GitHub. Попробуй ещё раз.",
  unavailable: "GitHub OAuth пока не настроен.",
}

export function GithubConnectionNotice({ connected }: { connected: boolean }) {
  const status = useSearchParams().get("github")
  if (!status || !statusMessages[status] || (status === "connected" && !connected)) return null
  return (
    <p
      className={status === "connected" ? "github-description mt-3" : "github-error mt-3"}
      role="status"
    >
      {statusMessages[status]}
    </p>
  )
}

export function GithubConnectButton({
  value,
  disabled,
  className,
  settings = false,
  onDisconnect,
}: {
  value?: string | null
  disabled?: boolean
  className?: string
  settings?: boolean
  onDisconnect?: () => void
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const login = githubUsername(value)
  const oauthUrl = `/api/github/connect?from=${settings ? "settings" : "profile"}`

  function connect() {
    // The route sets an HTTP-only OAuth state cookie and redirects outside Next.js.
    window.location.assign(new URL(oauthUrl, window.location.origin).href)
  }

  async function disconnect() {
    setSaving(true)
    setError("")
    try {
      const result = await disconnectGithub()
      if (result.error) {
        setError(result.error)
        return
      }
      onDisconnect?.()
      setOpen(false)
      router.refresh()
    } catch {
      setError("Не удалось отключить GitHub. Попробуй ещё раз.")
    } finally {
      setSaving(false)
    }
  }

  const buttonClass = `github-connect-trigger ${className ?? ""}`
  const logo = !settings && (
    <Image
      src="/GitHub.svg"
      width={16}
      height={17}
      alt=""
      className="shrink-0 dark:invert"
      style={{ width: "auto", height: 18 }}
    />
  )

  if (!login)
    return (
      <Button
        type="button"
        variant="outline"
        className={buttonClass}
        disabled={disabled}
        onClick={connect}
        aria-label="Подключить GitHub"
      >
        {logo} GitHub{settings ? "+" : <Plus size={16} />}
      </Button>
    )

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!saving) {
          setError("")
          setOpen(next)
        }
      }}
      disablePointerDismissal={saving}
    >
      <Dialog.Trigger
        render={
          <Button
            type="button"
            variant="outline"
            className={buttonClass}
            disabled={disabled}
            aria-label="Управление GitHub"
          />
        }
      >
        {logo}
        {settings ? "Управлять" : "GitHub"}
        <Check size={16} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="github-dialog-backdrop" />
        <Dialog.Popup className="site-surface github-dialog">
          <div className="github-dialog-header">
            <span className="github-dialog-logo">
              <Image
                src="/GitHub.svg"
                width={16}
                height={17}
                alt=""
                className="dark:invert"
                style={{ width: "auto", height: 24 }}
              />
            </span>
            <Dialog.Close
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Закрыть окно"
                  disabled={saving}
                />
              }
            >
              <X />
            </Dialog.Close>
          </div>
          <Dialog.Title className="github-dialog-title">GitHub подключён</Dialog.Title>
          <Dialog.Description className="github-dialog-description">
            Подключён аккаунт <strong>@{login}</strong>. Чтобы сменить его, авторизуйся через GitHub
            ещё раз.
          </Dialog.Description>
          {error && (
            <p className="github-error" role="alert">
              {error}
            </p>
          )}
          <div className="github-dialog-actions">
            <Button
              type="button"
              variant="ghost"
              className="github-disconnect"
              disabled={saving}
              onClick={disconnect}
            >
              {saving ? "Отключаем…" : "Отключить"}
            </Button>
            <Button type="button" className="github-confirm" disabled={saving} onClick={connect}>
              <RotateCw size={16} /> Переподключить
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
