import { authApi } from "@/services/auth.api"
import { PROFILE_USERNAME_TAKEN, validateProfileUsername } from "@/shared/lib/profile-routes"
import type { ProfileSettings } from "@/shared/lib/profile-settings"
import type { Skill, User } from "@/types/models"

export async function loadLegacyProfile(token: string): Promise<ProfileSettings | 401 | null> {
  const response = await authApi("auth/me", { headers: { Authorization: `Bearer ${token}` } })
  if (response.status === 401 || response.status === 404) return 401
  if (!response.ok) return null

  const account = await response.json() as User
  const details = await authApi(`users/${encodeURIComponent(account.username)}`)
  if (!details.ok) return null

  const profile = await details.json() as User
  if (profile.id !== account.id || !Array.isArray(profile.userSkills)) return null

  return {
    id: account.id,
    username: account.username,
    name: account.name,
    firstName: null,
    lastName: null,
    bio: account.bio,
    locationId: account.locationId,
    gender: null,
    website: null,
    socialLinks: null,
    avatarUrl: account.avatarUrl,
    userSkills: profile.userSkills.map(({ skillId }) => ({ skillId })),
  }
}

function isId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 2147483647
}

export async function saveLegacyProfile(data: FormData, token: string, login: string) {
  const current = await loadLegacyProfile(token)
  if (current === 401) return { redirectTo: login }
  if (!current) return { error: "Не удалось загрузить текущие данные профиля. Попробуйте ещё раз." }

  const rawSettings = data.get("settings")
  let payload: unknown
  try {
    payload = typeof rawSettings === "string" ? JSON.parse(rawSettings) : null
  } catch {
    return { error: "Проверьте данные профиля." }
  }
  if (!payload || typeof payload !== "object") return { error: "Проверьте данные профиля." }

  const { username, firstName, lastName, bio, locationId, skillIds, gender, website, socialLinks } = payload as Record<string, unknown>
  const hasLinks = socialLinks && typeof socialLinks === "object" && Object.values(socialLinks).some(Boolean)
  if (gender || website || hasLinks) {
    return { error: "Пол и ссылки можно будет сохранить после обновления сервера." }
  }
  if (typeof username !== "string" || typeof firstName !== "string" || typeof lastName !== "string"
    || typeof bio !== "string" || (locationId !== null && !isId(locationId))
    || !Array.isArray(skillIds) || !skillIds.every(isId)) {
    return { error: "Проверьте данные профиля." }
  }

  const nextUsername = username === current.username ? username : username.trim().toLowerCase()
  const usernameError = nextUsername === current.username ? undefined : validateProfileUsername(nextUsername)
  if (usernameError) return { usernameError }

  const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ")
  if (name.length > 100) return { error: "Имя и фамилия вместе должны занимать до 100 символов." }
  if (bio !== current.bio && bio.length > 120) return { error: "Описание должно занимать до 120 символов." }
  if (locationId === null && current.locationId !== null) {
    return { error: "На текущей версии сервера можно выбрать другой город. Убрать город пока нельзя." }
  }

  const previousSkills = new Set(current.userSkills.map(({ skillId }) => skillId))
  const nextSkills = new Set(skillIds)
  const additions = [...nextSkills].filter((id) => !previousSkills.has(id))
  const removals = [...previousSkills].filter((id) => !nextSkills.has(id))
  if (nextSkills.size > 10 && additions.length) return { error: "Можно выбрать до 10 навыков." }
  if (additions.length) {
    const catalog = await authApi("skills")
    if (!catalog.ok) return { error: "Не удалось проверить выбранные навыки. Попробуйте ещё раз." }
    const available = new Set((await catalog.json() as Skill[]).map(({ id }) => id))
    if (additions.some((id) => !available.has(id))) return { error: "Один из выбранных навыков больше недоступен." }
  }

  const headers = { Authorization: `Bearer ${token}` }
  const jsonHeaders = { ...headers, "Content-Type": "application/json" }
  const patch: Record<string, string | number> = {}
  if (nextUsername !== current.username) patch.username = nextUsername
  if (name !== (current.name ?? "").trim().replace(/\s+/g, " ")) patch.name = name
  if (bio !== (current.bio ?? "")) patch.bio = bio.trim()
  if (locationId !== null && locationId !== current.locationId) patch.locationId = locationId

  let saved = current
  const retryMessage = "Не удалось сохранить все изменения. Повторите сохранение, чтобы завершить обновление."
  try {
    if (Object.keys(patch).length) {
      const response = await authApi("users/me", { method: "PATCH", headers: jsonHeaders, body: JSON.stringify(patch) })
      if (response.status === 401) return { redirectTo: login }
      if (response.status === 409) return { usernameError: PROFILE_USERNAME_TAKEN }
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        return { error: response.status === 400 && typeof body?.error === "string" ? body.error : retryMessage }
      }
      const account = await response.json() as User
      if (patch.username && account.username !== nextUsername) {
        return { usernameError: "Не удалось изменить ник. Попробуйте ещё раз." }
      }
      saved = { ...saved, username: account.username, name: account.name, bio: account.bio, locationId: account.locationId }
    }

    for (const id of removals) {
      const response = await authApi(`users/me/skills/${id}`, { method: "DELETE", headers })
      if (response.status === 401) return { redirectTo: login }
      if (!response.ok && response.status !== 404) return { error: retryMessage }
    }
    for (const id of additions) {
      const response = await authApi(`users/me/skills/${id}`, { method: "PUT", headers: jsonHeaders, body: "{}" })
      if (response.status === 401) return { redirectTo: login }
      if (!response.ok) return { error: retryMessage }
    }

    const avatar = data.get("avatar")
    if (avatar instanceof File) {
      const upload = new FormData()
      upload.set("avatar", avatar)
      const response = await authApi("users/me/avatar", { method: "POST", headers, body: upload })
      if (response.status === 401) return { redirectTo: login }
      if (!response.ok) return { error: "Не удалось загрузить аватар. Повторите сохранение." }
      saved = { ...saved, avatarUrl: (await response.json() as User).avatarUrl }
    }

    return { profile: { ...saved, userSkills: [...nextSkills].map((skillId) => ({ skillId })) } }
  } catch {
    return { error: retryMessage }
  }
}
