"use server"

import { CredentialsSignin } from "next-auth"
import { auth, signIn } from "@/auth"
import { authApi, loadLocations, postAuth, type EmailCodeChallenge } from "@/services/auth.api"
import { authCompletePath, safeCallback } from "@/shared/lib/auth-redirect"
import { OWN_PROFILE_PATH, validateProfileUsername } from "@/shared/lib/profile-routes"
import type { LocationEntity } from "@/types/models"

type AuthResult<T extends object> =
  | (T & { error?: never })
  | ({ error: string } & { [Key in keyof T]?: never })

const messages: Record<string, string> = {
  invalid_password: "Проверьте почту и пароль.",
  invalid_code: "Код неверный или истёк. Проверьте его или запросите новый.",
  account_missing: "Аккаунт с этой почтой не найден. Сначала зарегистрируйтесь.",
}

const unavailable = "Сервис входа временно недоступен. Попробуйте ещё раз."

function emailFrom(value: FormDataEntryValue | null) {
  const email = typeof value === "string" ? value.trim() : ""
  return email.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}

async function startSession(
  provider: "credentials" | "email-code",
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
    }
  }
}

export async function submitAuth(
  mode: "login" | "register",
  data: FormData,
  callbackUrl?: string,
): Promise<AuthResult<{ redirectTo: string }>> {
  const email = emailFrom(data.get("email"))
  const password = data.get("password")
  if (!email) return { error: "Проверьте адрес электронной почты." }
  if (typeof password !== "string" || !password || password.length > 1024) {
    return { error: "Введите пароль." }
  }
  if (mode === "login") return startSession("credentials", { email, password }, callbackUrl)
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
      return { error: typeof error === "string" ? error : "Почта или ник уже заняты." }
    }
    if (!response.ok) return { error: "Не удалось создать аккаунт. Попробуйте ещё раз." }
  } catch {
    return { error: "Не удалось связаться с сервером. Попробуйте ещё раз." }
  }

  const result = await startSession("credentials", { email, password }, callbackUrl)
  if (result.redirectTo) return result
  const callback = safeCallback(callbackUrl)
  return {
    redirectTo: callback
      ? `/login?registered=1&callbackUrl=${encodeURIComponent(callback)}`
      : "/login?registered=1",
  }
}

export async function requestLoginCode(
  value: string,
): Promise<AuthResult<{ challenge: EmailCodeChallenge }>> {
  if (process.env.AUTH_EMAIL_CODE_ENABLED !== "true")
    return { error: "Вход по коду пока недоступен." }
  const email = emailFrom(value)
  if (!email) return { error: "Проверьте адрес электронной почты." }

  try {
    const response = await postAuth("email-code", { mode: "login", email })
    if (response.status === 429) return { error: "Подождите перед повторным запросом кода." }
    if (!response.ok) return { error: "Не удалось отправить код. Попробуйте ещё раз." }
    const challenge = (await response.json()) as EmailCodeChallenge
    if (
      typeof challenge.challengeId !== "string" ||
      !challenge.challengeId ||
      challenge.challengeId.length > 128 ||
      !Number.isSafeInteger(challenge.resendAfterSeconds) ||
      challenge.resendAfterSeconds < 0
    ) {
      return { error: "Не удалось отправить код. Попробуйте ещё раз." }
    }
    return { challenge }
  } catch {
    return { error: unavailable }
  }
}

export async function confirmEmailCode(
  challengeId: string,
  code: string,
  callbackUrl?: string,
): Promise<AuthResult<{ redirectTo: string }>> {
  if (process.env.AUTH_EMAIL_CODE_ENABLED !== "true")
    return { error: "Вход по коду пока недоступен." }
  return startSession("email-code", { challengeId, code }, callbackUrl)
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
