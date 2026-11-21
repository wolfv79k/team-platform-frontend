"use client"

import "@/app/styles/auth.css"
import "@/app/styles/forms.css"

import { useRef, useState, type FormEvent } from "react"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { authCompletePath } from "@/shared/lib/auth-redirect"
import type { EmailVerification } from "@/services/auth.api"
import { submitAuth } from "@/app/actions/auth"
import {
  rememberVerificationRequest,
  verificationResendDeadline,
} from "@/shared/lib/email-verification"
import { EmailVerificationDialog } from "./email-verification-dialog"
import { LocationField } from "./location-field"

type Props = {
  mode: "login" | "register"
  callbackUrl?: string
  oauthError?: boolean
  sessionExpired?: boolean
  registered?: boolean
  verified?: boolean
  initialEmail?: string
}

export function EmailAuthForm({
  mode,
  callbackUrl,
  oauthError,
  sessionExpired,
  registered,
  verified,
  initialEmail,
}: Props) {
  const register = mode === "register"
  const [locationReady, setLocationReady] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState<"email" | "github" | null>(null)
  const [error, setError] = useState(
    oauthError ? "Не удалось войти через GitHub. Попробуйте ещё раз." : "",
  )
  const [verification, setVerification] = useState<{
    details: EmailVerification
    password: string
    resendAt: number
  }>()
  const [verificationOpen, setVerificationOpen] = useState(false)
  const emailField = useRef<HTMLInputElement>(null)
  const switchPath = register ? "/login" : "/register"
  const switchUrl = callbackUrl
    ? `${switchPath}?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : switchPath

  async function github() {
    if (pending) return
    setPending("github")
    setError("")
    try {
      await signIn("github", { redirectTo: authCompletePath(callbackUrl) })
    } catch {
      setError("Не удалось открыть GitHub. Попробуйте ещё раз.")
    } finally {
      setPending(null)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || (register && !locationReady)) return
    const data = new FormData(event.currentTarget)
    const email = String(data.get("email") ?? "").trim()
    if (register && verification?.details.email === email) {
      setVerificationOpen(true)
      return
    }
    setPending("email")
    setError("")
    try {
      const result = await submitAuth(mode, data, callbackUrl)
      if (result.redirectTo) {
        window.location.assign(result.redirectTo)
        return
      }
      if (result.verification) {
        const details = result.verification
        const resendAt =
          details.verificationEmailSent === null
            ? Math.max(
                verification?.details.email === details.email ? verification.resendAt : 0,
                verificationResendDeadline(details.email),
              )
            : rememberVerificationRequest(details.email)
        setVerification({ details, password: String(data.get("password") ?? ""), resendAt })
        setVerificationOpen(true)
      } else {
        setError(result.error ?? "Попробуйте ещё раз.")
      }
    } catch {
      setError("Не удалось отправить форму. Попробуйте ещё раз.")
    }
    setPending(null)
  }

  const submitLabel = register ? (verification ? "Подтвердить почту" : "Создать профиль") : "Войти"
  const progressLabel = register ? "Создаём профиль…" : "Входим…"

  return (
    <section className="auth-page">
      <h1>
        {register ? (
          "Зарегистрируйся и создай профиль"
        ) : (
          <>
            С возвращением!
            <br />
            Войди в свой аккаунт
          </>
        )}
      </h1>
      <div className="auth-card">
        <Button
          type="button"
          variant="outline"
          onClick={github}
          disabled={pending !== null}
          className="btn secondary oauth"
        >
          {pending === "github" ? "Открываем GitHub…" : "Войти через GitHub"}
        </Button>
        <span className="oauth-logo">
          <Image src="/GitHub.svg" width={18} height={18} alt="" />
        </span>
        <div className="divider-label">или продолжи с почтой</div>

        <form method="post" onSubmit={submit}>
          <div className="field">
            <label htmlFor="auth-email" className="text-sm font-medium">
              Адрес электронной почты <span className="required">*</span>
            </label>
            <Input
              id="auth-email"
              ref={emailField}
              defaultValue={initialEmail}
              onChange={(event) => {
                if (verification && event.target.value.trim() !== verification.details.email) {
                  setVerification(undefined)
                }
              }}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              maxLength={255}
              className="h-11 border-foreground/25"
            />
          </div>
          <div className="field">
            <label htmlFor="auth-password" className="text-sm font-medium">
              Пароль <span className="required">*</span>
            </label>
            <div className="relative">
              <Input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={register ? "new-password" : "current-password"}
                required
                minLength={register ? 8 : undefined}
                maxLength={register ? 72 : 1024}
                className="h-11 border-foreground/25 pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 size-11"
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </Button>
            </div>
          </div>
          {register && (
            <>
              <div className="field">
                <label htmlFor="auth-username" className="text-sm font-medium">
                  Username <span className="required">*</span>
                </label>
                <Input
                  id="auth-username"
                  name="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  pattern="[a-zA-Z0-9_]{3,50}"
                  required
                  maxLength={50}
                  aria-describedby="auth-username-hint"
                  className="h-11 border-foreground/25"
                />
                <small id="auth-username-hint">Строчные латинские буквы, цифры и _</small>
              </div>
              <LocationField onReady={setLocationReady} />
            </>
          )}
          {error && (
            <p role="alert" className="rounded-lg border border-destructive/40 px-3 py-2 text-sm">
              {error}
            </p>
          )}
          {!error && (verified || registered || sessionExpired || verification) && (
            <p role="status" className="text-sm text-muted-foreground">
              {verification
                ? "Подтвердите почту, чтобы завершить регистрацию и войти."
                : verified
                  ? "Почта подтверждена. Войдите, чтобы продолжить."
                  : registered
                    ? "Профиль создан. Войдите, чтобы продолжить."
                    : "Сессия истекла. Войдите снова."}
            </p>
          )}
          <Button
            type="submit"
            disabled={pending !== null || (register && !locationReady)}
            className="btn primary auth-submit"
          >
            {pending === "email" ? progressLabel : submitLabel}
            <span className="icon" aria-hidden="true">
              <ArrowRight strokeWidth={1.65} />
            </span>
          </Button>
        </form>

        <p className="auth-bottom">
          {register ? "Уже есть аккаунт? " : "Нет аккаунта? "}
          <Link href={switchUrl}>{register ? "Войдите" : "Зарегистрируйтесь"}</Link>
        </p>
      </div>

      {verification && verificationOpen && (
        <EmailVerificationDialog
          verification={verification.details}
          password={verification.password}
          initialResendAt={Math.max(
            verification.resendAt,
            verificationResendDeadline(verification.details.email),
          )}
          callbackUrl={callbackUrl}
          returnFocus={emailField}
          onClose={() => setVerificationOpen(false)}
          onResend={(resendAt) =>
            setVerification(
              (current) =>
                current && {
                  ...current,
                  details: { ...current.details, verificationEmailSent: null },
                  resendAt,
                },
            )
          }
        />
      )}
    </section>
  )
}
