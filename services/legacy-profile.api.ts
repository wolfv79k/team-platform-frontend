import { authApi } from "@/services/auth.api"
import { PROFILE_USERNAME_TAKEN, validateProfileUsername } from "@/shared/lib/profile-routes"
import {
  profileSocialLinks,
  socialFields,
  validProfileLink,
  webLink,
  type ProfileSettings,
} from "@/shared/lib/profile-settings"
import type { Skill, User } from "@/types/models"
import { SkillLevel } from "@/types/enums"

export async function loadLegacyProfile(token: string): Promise<ProfileSettings | 401 | null> {
  const response = await authApi("auth/me", { headers: { Authorization: `Bearer ${token}` } })
  if (response.status === 401 || response.status === 404) return 401
  if (!response.ok) return null

  const account = (await response.json()) as User
  const details = await authApi(`users/${encodeURIComponent(account.username)}`)
  if (!details.ok) return null

  const profile = (await details.json()) as User
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
    website: profile.websiteUrl ?? account.websiteUrl ?? null,
    resume: profile.resumeUrl ?? account.resumeUrl ?? null,
    socialLinks: profileSocialLinks(profile.socialLinks),
    avatarUrl: account.avatarUrl,
    userSkills: profile.userSkills.map(({ skillId, skillLevel }) => ({ skillId, skillLevel: skillLevel ?? SkillLevel.BEGINNER })),
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

  const {
    username,
    firstName,
    lastName,
    bio,
    locationId,
    skillIds,
    skillLevels,
    gender,
    website = current.website ?? "",
    resume = current.resume ?? "",
    socialLinks,
  } = payload as Record<string, unknown>
  if (gender) {
    return { error: "Пол пока сохраняется только в этом браузере." }
  }
  if (!validProfileLink(website) || !validProfileLink(resume)) {
    return {
      error: "Укажите корректную ссылку на сайт или резюме, до 500 символов, с http или https.",
    }
  }
  if (
    socialLinks !== undefined &&
    (!socialLinks || typeof socialLinks !== "object" || Array.isArray(socialLinks))
  ) {
    return { error: "Проверьте ссылки на социальные сети." }
  }
  const nextLinks = { ...current.socialLinks }
  for (const { key, label } of socialFields) {
    const value = (socialLinks as Record<string, unknown> | undefined)?.[key]
    if (value === undefined) continue
    if (!validProfileLink(value))
      return { error: `Укажите корректную ссылку для ${label}, до 500 символов, с http или https.` }
    nextLinks[key] = webLink(value)
  }
  if (
    typeof username !== "string" ||
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof bio !== "string" ||
    (locationId !== null && !isId(locationId)) ||
    !Array.isArray(skillIds) ||
    !skillIds.every(isId)
  ) {
    return { error: "Проверьте данные профиля." }
  }

  const nextUsername = username === current.username ? username : username.trim().toLowerCase()
  const usernameError =
    nextUsername === current.username ? undefined : validateProfileUsername(nextUsername)
  if (usernameError) return { usernameError }

  const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ")
  if (name.length > 100) return { error: "Имя и фамилия вместе должны занимать до 100 символов." }
  if (bio !== current.bio && bio.length > 120)
    return { error: "Описание должно занимать до 120 символов." }
  if (locationId === null && current.locationId !== null) {
    return {
      error: "На текущей версии сервера можно выбрать другой город. Убрать город пока нельзя.",
    }
  }

  const previousSkills = new Map(current.userSkills.map(({ skillId, skillLevel }) => [skillId, skillLevel]))
  if (skillLevels !== undefined && (!skillLevels || typeof skillLevels !== "object" || Array.isArray(skillLevels))) {
    return { error: "Проверьте уровни навыков." }
  }
  const levels = skillLevels === undefined
    ? Object.fromEntries(skillIds.map((id) => [id, previousSkills.get(id) ?? SkillLevel.BEGINNER]))
    : skillLevels as Record<string, unknown>
  if (skillIds.some((id) => !Object.values(SkillLevel).includes(levels[id] as SkillLevel))) {
    return { error: "Выберите корректный уровень навыка." }
  }
  const nextSkills = new Set(skillIds)
  const additions = [...nextSkills].filter((id) => !previousSkills.has(id))
  const changes = [...nextSkills].filter((id) => previousSkills.get(id) !== levels[id])
  const removals = [...previousSkills.keys()].filter((id) => !nextSkills.has(id))
  if (nextSkills.size > 10 && additions.length) return { error: "Можно выбрать до 10 навыков." }
  if (additions.length) {
    const catalog = await authApi("skills")
    if (!catalog.ok) return { error: "Не удалось проверить выбранные навыки. Попробуйте ещё раз." }
    const available = new Set(((await catalog.json()) as Skill[]).map(({ id }) => id))
    if (additions.some((id) => !available.has(id)))
      return { error: "Один из выбранных навыков больше недоступен." }
  }

  const headers = { Authorization: `Bearer ${token}` }
  const jsonHeaders = { ...headers, "Content-Type": "application/json" }
  const patch: Record<string, string | number> = {}
  if (nextUsername !== current.username) patch.username = nextUsername
  if (name !== (current.name ?? "").trim().replace(/\s+/g, " ")) patch.name = name
  if (bio !== (current.bio ?? "")) patch.bio = bio.trim()
  if (locationId !== null && locationId !== current.locationId) patch.locationId = locationId
  const nextWebsite = webLink(website)
  const nextResume = webLink(resume)
  if (nextWebsite !== (current.website ?? "")) patch.websiteUrl = nextWebsite
  if (nextResume !== (current.resume ?? "")) patch.resumeUrl = nextResume

  const retryMessage =
    "Не удалось сохранить все изменения. Повторите сохранение, чтобы завершить обновление."
  try {
    if (Object.keys(patch).length) {
      const response = await authApi("users/me", {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify(patch),
      })
      if (response.status === 401) return { redirectTo: login }
      if (response.status === 409) return { usernameError: PROFILE_USERNAME_TAKEN }
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        return {
          error:
            response.status === 400 && typeof body?.error === "string" ? body.error : retryMessage,
        }
      }
      const account = (await response.json()) as User
      if (patch.username && account.username !== nextUsername) {
        return { usernameError: "Не удалось изменить ник. Попробуйте ещё раз." }
      }
    }

    for (const { key, platform } of socialFields) {
      const value = nextLinks[key] ?? ""
      if (value === (current.socialLinks?.[key] ?? "")) continue
      const response = await authApi(`users/me/socials/${platform}`, {
        method: value ? "PUT" : "DELETE",
        headers: value ? jsonHeaders : headers,
        ...(value ? { body: JSON.stringify({ url: value }) } : {}),
      })
      if (response.status === 401) return { redirectTo: login }
      if (!response.ok && !(response.status === 404 && !value)) return { error: retryMessage }
    }

    for (const id of removals) {
      const response = await authApi(`users/me/skills/${id}`, { method: "DELETE", headers })
      if (response.status === 401) return { redirectTo: login }
      if (!response.ok && response.status !== 404) return { error: retryMessage }
    }
    for (const id of changes) {
      const response = await authApi(`users/me/skills/${id}`, {
        method: "PUT",
        headers: jsonHeaders,
        body: JSON.stringify({ skillLevel: levels[id] }),
      })
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
    }

    const saved = await loadLegacyProfile(token)
    if (saved === 401) return { redirectTo: login }
    if (!saved) return { error: retryMessage }
    if (
      (saved.website ?? "") !== nextWebsite ||
      (saved.resume ?? "") !== nextResume ||
      socialFields.some(({ key }) => (saved.socialLinks?.[key] ?? "") !== (nextLinks[key] ?? "")) ||
      saved.userSkills.length !== nextSkills.size ||
      saved.userSkills.some(({ skillId, skillLevel }) => !nextSkills.has(skillId) || levels[skillId] !== skillLevel)
    ) {
      return {
        error: "Сервер не сохранил все изменения профиля. Повторите сохранение после обновления страницы.",
      }
    }
    return { profile: saved }
  } catch {
    return { error: retryMessage }
  }
}
