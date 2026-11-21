"use client"

import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import type { EmailVerification } from "@/services/auth.api"
import { confirmEmailVerification, resendVerificationCode } from "@/app/actions/auth"
import {
  clearVerificationRequest,
  rememberVerificationRequest,
} from "@/shared/lib/email-verification"

type Props = {
  verification: EmailVerification
  password: string
  initialResendAt: number
  callbackUrl?: string
  onClose: () => void
  onResend: (deadline: number) => void
  returnFocus: RefObject<HTMLElement | null>
}

export function EmailVerificationDialog({
  verification,
  password,
  initialResendAt,
  callbackUrl,
  onClose,
  onResend,
  returnFocus,
}: Props) {
  const { email, verificationEmailSent } = verification
  const input = useRef<HTMLInputElement>(null)
  const [code, setCode] = useState("")
  const [activeDigit, setActiveDigit] = useState(0)
  const [error, setError] = useState("")
  const [announcement, setAnnouncement] = useState("")
  const [pending, setPending] = useState<"confirm" | "resend" | null>(null)
  const [resendAt, setResendAt] = useState(initialResendAt)
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.ceil((initialResendAt - Date.now()) / 1000)),
  )
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (resendAt <= Date.now()) return
    const timer = window.setInterval(() => {
      const seconds = Math.max(0, Math.ceil((resendAt - Date.now()) / 1000))
      setRemaining(seconds)
      if (seconds === 0) window.clearInterval(timer)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [resendAt])

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || code.length !== 6) return
    setPending("confirm")
    setError("")
    try {
      const result = await confirmEmailVerification(email, code, password, callbackUrl)
      if (result.redirectTo) {
        clearVerificationRequest(email)
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
      const result = await resendVerificationCode(email)
      if (result.accepted) {
        const deadline = rememberVerificationRequest(email)
        onResend(deadline)
        setResendAt(deadline)
        setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)))
        setCode("")
        setActiveDigit(0)
        setAnnouncement("Если отправка доступна, письмо придёт на указанный адрес.")
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
        <Dialog.Backdrop className="email-verification-backdrop motion-safe:transition-opacity motion-safe:duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <Dialog.Popup
          initialFocus={input}
          finalFocus={returnFocus}
          className="email-verification-dialog motion-safe:transition-opacity motion-safe:duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0"
        >
          <span className="brand-mark email-verification-mark" aria-hidden="true" />
          <Dialog.Close
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="email-verification-close"
                aria-label="Закрыть окно"
                disabled={pending !== null}
              />
            }
          >
            <X aria-hidden="true" />
          </Dialog.Close>
          <Dialog.Title className="email-verification-title">Проверьте почту</Dialog.Title>
          <Dialog.Description className="email-verification-description">
            {verificationEmailSent === true ? "Мы отправили код на " : "Подтвердите почту "}
            <strong>{email}</strong>
          </Dialog.Description>
          {verificationEmailSent === false && !announcement && (
            <p role="status" className="email-verification-notice">
              Аккаунт создан, но письмо отправить не удалось. Повторите отправку после окончания
              таймера.
            </p>
          )}

          <form method="post" onSubmit={confirm} className="email-verification-form">
            <label htmlFor="email-code" className="sr-only">
              Шестизначный код
            </label>
            <div className="email-code-control" data-invalid={Boolean(error)}>
              <div className="email-code-slots" aria-hidden="true">
                {Array.from({ length: 6 }, (_, index) => (
                  <span key={index} className="email-code-slot" data-active={activeDigit === index}>
                    {code[index]}
                  </span>
                ))}
              </div>
              <Input
                id="email-code"
                ref={input}
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                pattern="[0-9]{6}"
                value={code}
                readOnly={pending !== null}
                onChange={(event) => {
                  setCode(event.currentTarget.value.replace(/\D/g, "").slice(0, 6))
                  setError("")
                }}
                onSelect={(event) =>
                  setActiveDigit(Math.min(event.currentTarget.selectionStart ?? 0, 5))
                }
                onPointerDown={(event) => {
                  event.preventDefault()
                  const bounds = event.currentTarget.getBoundingClientRect()
                  const slot = Math.floor(((event.clientX - bounds.left) / bounds.width) * 6)
                  const position = Math.max(0, Math.min(slot, code.length, 5))
                  event.currentTarget.focus()
                  event.currentTarget.setSelectionRange(position, position + 1)
                  setActiveDigit(position)
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "email-code-error" : undefined}
                className="email-code-input"
              />
            </div>
            {error && (
              <p id="email-code-error" role="alert" className="email-verification-error">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={code.length !== 6 || pending !== null}
              className="email-verification-submit"
            >
              {pending === "confirm" ? "Проверяем…" : "Подтвердить"}
            </Button>
          </form>
          {announcement && (
            <p role="status" className="email-verification-notice">
              {announcement}
            </p>
          )}
          <div className="email-verification-resend">
            <span>Не пришло письмо?</span>
            <Button
              type="button"
              variant="ghost"
              className="email-verification-resend-button"
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
