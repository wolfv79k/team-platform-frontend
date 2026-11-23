"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { authApi } from "@/services/auth.api"
import { saveLegacyProfile } from "@/services/legacy-profile.api"
import {
  OWN_PROFILE_PATH,
  PROFILE_SETTINGS_PATH,
  PROFILE_USERNAME_TAKEN,
  validateProfileUsername,
} from "@/shared/lib/profile-routes"
import { avatarError } from "@/shared/lib/profile-settings"

function revalidateProfilePages() {
  revalidatePath("/", "layout")
  revalidatePath(OWN_PROFILE_PATH)
  revalidatePath(PROFILE_SETTINGS_PATH)
  revalidatePath("/[username]", "page")
}

export async function disconnectGithub() {
  const session = await auth()
  if (!session?.accessToken || !session.appUser?.id) return { error: "Войдите в аккаунт." }
  try {
    const response = await authApi("users/me/socials/GITHUB", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
    if (!response.ok && response.status !== 404)
      return { error: "Не удалось отключить GitHub. Попробуйте ещё раз." }
    revalidateProfilePages()
    return { success: true }
  } catch {
    return { error: "Не удалось отключить GitHub. Попробуйте ещё раз." }
  }
}

export async function checkProfileUsername(value: string) {
  const session = await auth()
  if (!session?.accessToken || !session.appUser?.id) return
  const username = value.trim().toLowerCase()
  const error = validateProfileUsername(username)
  if (error) return { usernameError: error }

  try {
    const response = await authApi(`users/${encodeURIComponent(username)}`)
    if (!response.ok) return
    const profile = await response.json()
    if (Number.isInteger(profile?.id) && profile.id !== session.appUser.id) {
      return { usernameError: PROFILE_USERNAME_TAKEN }
    }
  } catch {
    // Saving still checks for a conflict when availability cannot be confirmed here.
  }
}

export async function saveProfile(data: FormData) {
  const session = await auth()
  const login = `/login?callbackUrl=${encodeURIComponent(PROFILE_SETTINGS_PATH)}`
  if (!session?.accessToken) return { redirectTo: login }

  const avatar = data.get("avatar")
  if (avatar instanceof File) {
    const error = avatarError(avatar)
    if (error) return { error }
  }

  try {
    const result = await saveLegacyProfile(data, session.accessToken, login)
    revalidateProfilePages()
    return result
  } catch {
    return { error: "Не удалось связаться с сервером. Попробуйте ещё раз." }
  }
}
