"use server"

import { CredentialsSignin } from "next-auth"
import { auth, signIn } from "@/auth"
import { authApi, loadLocations, postAuth, type EmailVerification } from "@/services/auth.api"
import { authCompletePath, safeCallback } from "@/shared/lib/auth-redirect"
import { OWN_PROFILE_PATH, validateProfileUsername } from "@/shared/lib/profile-routes"
import type { LocationEntity } from "@/types/models"

type AuthResult<T extends object> =
  | (T & { error?: never })
  | ({ error: string; code?: string } & { [Key in keyof T]?: never })

type AuthSubmission =
  | { redirectTo: string; verification?: never }
  | { verification: EmailVerification; redirectTo?: never }

const messages: Record<string, string> = {
  invalid_password: "Проверьте почту и пароль.",
  email_not_verified: "Подтвердите почту, чтобы войти.",
}

const unavailable = "Сервис входа временно недоступен. Попробуйте ещё раз."

function emailFrom(value: FormDataEntryValue | null) {
  const email = typeof value === "string" ? value.trim() : ""
  return email.length <= 255 && /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email) ? email : null
}

async function startSession(
  provider: "credentials",
  credentials: Record<string, string>,
  callbackUrl?: string,
): Promise<AuthResult<{ redirectTo: string }>> {
  const redirectTo = authCompletePath(callbackUrl)
  try {
    await signIn(provider, { ...credentials, redirect: false, redirectTo })
    return { redirectTo }
  } catch (error) {
    return {
      error:
        error instanceof CredentialsSignin ? (messages[error.code] ?? unavailable) : unavailable,
      code: error instanceof CredentialsSignin ? error.code : undefined,
    }
  }
}

export async function submitAuth(
  mode: "login" | "register",
  data: FormData,
  callbackUrl?: string,
): Promise<AuthResult<AuthSubmission>> {
  const email = emailFrom(data.get("email"))
  const password = data.get("password")
  if (!email) return { error: "Проверьте адрес электронной почты." }
  if (typeof password !== "string" || !password || password.length > 1024) {
    return { error: "Введите пароль." }
  }
  if (mode === "login") {
    const result = await startSession("credentials", { email, password }, callbackUrl)
    if (result.error && result.code === "email_not_verified") {
      return { verification: { email, verificationEmailSent: null } }
    }
    return result
  }
  if (mode !== "register") return { error: "Не удалось обработать форму." }

  const nickname = data.get("username")
  const username = typeof nickname === "string" ? nickname.trim().toLowerCase() : ""
  const locationId = Number(data.get("locationId"))
  const usernameError = validateProfileUsername(username)
  if (usernameError) return { error: usernameError }
  if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
    return {
      error:
        "Используйте не менее 8 символов. Для длинного пароля подойдут латинские буквы и цифры.",
    }
  }
  if (!Number.isSafeInteger(locationId) || locationId < 1 || locationId > 2147483647) {
    return { error: "Выберите город из списка." }
  }

  try {
    const response = await postAuth("register", { email, username, password, locationId })
    if (response.status === 409) {
      const { error } = await response.json().catch(() => ({}))
      const login = await postAuth("login", { email, password })
      if (login.status === 403) {
        const result = await login.json().catch(() => null)
        if (result?.code === "EMAIL_NOT_VERIFIED") {
          return { verification: { email, verificationEmailSent: null } }
        }
      }
      if (login.status >= 500) return { error: unavailable }
      return { error: typeof error === "string" ? error : "Почта или ник уже заняты." }
    }
    if (!response.ok) return { error: "Не удалось создать аккаунт. Попробуйте ещё раз." }
    const registration = await response.json()
    return {
      verification: { email, verificationEmailSent: registration.verificationEmailSent === true },
    }
  } catch {
    return { error: "Не удалось связаться с сервером. Попробуйте ещё раз." }
  }
}

export async function resendVerificationCode(
  value: string,
): Promise<AuthResult<{ accepted: true }>> {
  const email = emailFrom(value)
  if (!email) return { error: "Проверьте адрес электронной почты." }

  try {
    const response = await postAuth("resend-verification", { email })
    if (response.status === 429) return { error: "Подождите перед повторным запросом кода." }
    if (response.status !== 202) {
      return { error: "Не удалось отправить код. Попробуйте ещё раз." }
    }
    return { accepted: true }
  } catch {
    return { error: unavailable }
  }
}

export async function confirmEmailVerification(
  value: string,
  code: string,
  password: string,
  callbackUrl?: string,
): Promise<AuthResult<{ redirectTo: string }>> {
  const email = emailFrom(value)
  if (!email) return { error: "Проверьте адрес электронной почты." }
  if (typeof code !== "string" || !/^[0-9]{6}$/.test(code)) {
    return { error: "Введите шестизначный код из письма." }
  }
  if (typeof password !== "string" || !password || password.length > 1024) {
    return { error: "Закройте окно и введите пароль ещё раз." }
  }

  try {
    const response = await postAuth("verify-email", { email, code })
    if (response.status === 400) {
      return { error: "Код недействителен. Проверьте код или запросите новый." }
    }
    if (response.status === 429)
      return { error: "Слишком много попыток. Запросите новый код позже." }
    if (response.status !== 204)
      return { error: "Не удалось подтвердить почту. Попробуйте ещё раз." }
  } catch {
    return { error: unavailable }
  }

  const result = await startSession("credentials", { email, password }, callbackUrl)
  if (result.redirectTo) return result

  // Verification succeeded even if creating the session failed. Continue from the login form.
  const params = new URLSearchParams({ verified: "1", email })
  const callback = safeCallback(callbackUrl)
  if (callback) params.set("callbackUrl", callback)
  return { redirectTo: `/login?${params}` }
}

export async function getAuthLocations(): Promise<AuthResult<{ locations: LocationEntity[] }>> {
  try {
    return { locations: await loadLocations() }
  } catch {
    return { error: "Не удалось загрузить список городов." }
  }
}

export async function saveAuthLocation(
  locationId: number,
  callbackUrl?: string,
): Promise<AuthResult<{ redirectTo: string }>> {
  const session = await auth()
  if (!session?.accessToken) return { redirectTo: "/login?reason=session-expired" }
  if (!Number.isSafeInteger(locationId) || locationId < 1 || locationId > 2147483647) {
    return { error: "Выберите город из списка." }
  }

  try {
    const response = await authApi("users/me", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ locationId }),
    })
    if (response.status === 401) return { redirectTo: "/login?reason=session-expired" }
    if (response.status === 400) return { error: "Этот город недоступен. Выберите другой." }
    if (response.ok) return { redirectTo: safeCallback(callbackUrl) ?? OWN_PROFILE_PATH }
  } catch {
    return { error: "Не удалось связаться с сервером. Попробуйте ещё раз." }
  }
  return { error: "Не удалось сохранить город. Попробуйте ещё раз." }
}
