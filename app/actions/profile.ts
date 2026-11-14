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
import { avatarError, type ProfileSettings } from "@/shared/lib/profile-settings"

function revalidateProfilePages() {
  revalidatePath("/", "layout")
  revalidatePath(OWN_PROFILE_PATH)
  revalidatePath(PROFILE_SETTINGS_PATH)
  revalidatePath("/[username]", "page")
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
    const response = await authApi("users/me/settings", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${session.accessToken}` },
      body: data,
    })
    if (response.status === 401) return { redirectTo: login }
    if (response.status === 404) {
      const result = await saveLegacyProfile(data, session.accessToken, login)
      revalidateProfilePages()
      return result
    }
    if (response.status === 409) return { usernameError: PROFILE_USERNAME_TAKEN }
    if (!response.ok) {
      const body = await response.json().catch(() => null)
      if ([400, 409, 502].includes(response.status) && typeof body?.error === "string") {
        return { error: body.error }
      }
      return { error: "Не удалось сохранить изменения. Попробуйте ещё раз." }
    }

    const profile = (await response.json()) as ProfileSettings
    revalidateProfilePages()
    return { profile }
  } catch {
    return { error: "Не удалось связаться с сервером. Попробуйте ещё раз." }
  }
}
