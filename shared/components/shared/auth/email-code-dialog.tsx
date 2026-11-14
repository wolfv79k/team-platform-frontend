"use client"

import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Mail, X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import type { EmailCodeChallenge } from "@/services/auth.api"
import { confirmEmailCode, requestLoginCode } from "@/app/actions/auth"

type Props = {
  email: string
  initialChallenge: EmailCodeChallenge
  callbackUrl?: string
  onClose: () => void
  returnFocus: RefObject<HTMLElement | null>
}

export function EmailCodeDialog({
  email,
  initialChallenge,
  callbackUrl,
  onClose,
  returnFocus,
}: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [challenge, setChallenge] = useState(initialChallenge)
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [announcement, setAnnouncement] = useState("")
  const [pending, setPending] = useState<"confirm" | "resend" | null>(null)
  const [remaining, setRemaining] = useState(challenge.resendAfterSeconds)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const deadline = Date.now() + challenge.resendAfterSeconds * 1000
    const timer = window.setInterval(() => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setRemaining(seconds)
      if (seconds === 0) window.clearInterval(timer)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [challenge])

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || code.length !== 6) return
    setPending("confirm")
    setError("")
    try {
      const result = await confirmEmailCode(challenge.challengeId, code, callbackUrl)
      if (result.redirectTo) {
        window.location.assign(result.redirectTo)
        return
      }
      setError(result.error ?? "Попробуйте ещё раз.")
    } catch {
      setError("Не удалось проверить код. Попробуйте ещё раз.")
    }
    setPending(null)
    input.current?.select()
  }

  async function resend() {
    if (pending || remaining > 0) return
    setPending("resend")
    setError("")
    setAnnouncement("")
    try {
      const result = await requestLoginCode(email)
      if (result.challenge) {
        setChallenge(result.challenge)
        setRemaining(result.challenge.resendAfterSeconds)
        setCode("")
        setAnnouncement("Новый код отправлен.")
        input.current?.focus()
      } else {
        setError(result.error ?? "Попробуйте ещё раз.")
      }
    } catch {
      setError("Не удалось повторно отправить код.")
    }
    setPending(null)
  }

  return (
    <Dialog.Root
      open={open}
      disablePointerDismissal
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !pending) setOpen(false)
      }}
      onOpenChangeComplete={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-zinc-950/60 motion-safe:transition-opacity motion-safe:duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <Dialog.Popup
          initialFocus={input}
          finalFocus={returnFocus}
          className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[25rem] -translate-1/2 overflow-y-auto rounded-2xl border border-border bg-card text-card-foreground shadow-xl shadow-zinc-900/15 outline-none motion-safe:transition-opacity motion-safe:duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0"
        >
          <div className="relative px-5 pt-6 pb-5 sm:px-7 sm:pt-7">
            <div className="mb-4 grid size-11 place-items-center rounded-lg border bg-muted text-foreground">
              <Mail aria-hidden="true" className="size-5" strokeWidth={1.75} />
            </div>
            <Dialog.Close
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 size-11 text-foreground motion-reduce:transition-none"
                  aria-label="Закрыть окно"
                  disabled={pending !== null}
                />
              }
            >
              <X aria-hidden="true" />
            </Dialog.Close>
            <Dialog.Title className="text-2xl font-semibold tracking-tight">
              Проверьте почту
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Мы отправили код на{" "}
              <strong className="break-all font-semibold text-foreground">{email}</strong>
            </Dialog.Description>

            <form method="post" onSubmit={confirm} className="mt-6 grid gap-3">
              <label htmlFor="email-code" className="text-sm font-medium">
                Шестизначный код
              </label>
              <Input
                id="email-code"
                ref={input}
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                pattern="[0-9]{6}"
                value={code}
                readOnly={pending !== null}
                onChange={(event) =>
                  setCode(event.currentTarget.value.replace(/\D/g, "").slice(0, 6))
                }
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "email-code-error" : undefined}
                className="h-14 border-foreground/30 bg-muted/40 text-center text-foreground dark:bg-muted/40 font-mono text-2xl font-semibold tracking-[0.35em] tabular-nums focus-visible:border-primary focus-visible:ring-primary/30 md:text-2xl"
              />
              {error && (
                <p id="email-code-error" role="alert" className="text-sm text-foreground">
                  {error}
                </p>
              )}
              <span role="status" className="sr-only">
                {announcement}
              </span>
              <Button
                type="submit"
                disabled={code.length !== 6 || pending !== null}
                className="mt-1 h-11 w-full"
              >
                {pending === "confirm" ? "Проверяем…" : "Подтвердить вход"}
              </Button>
            </form>
          </div>
          <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-t bg-muted/30 px-5 py-2 sm:px-7">
            <Dialog.Close
              render={
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-10 px-2 text-foreground motion-reduce:transition-none"
                  disabled={pending !== null}
                />
              }
            >
              Изменить почту
            </Dialog.Close>
            <Button
              type="button"
              variant="ghost"
              className="min-h-10 px-2 text-foreground motion-reduce:transition-none"
              onClick={resend}
              disabled={pending !== null || remaining > 0}
            >
              {pending === "resend"
                ? "Отправляем…"
                : remaining > 0
                  ? `Повтор через ${remaining} с`
                  : "Отправить снова"}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
