import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { authApi, authApiUrl } from "@/services/auth.api"
import { loadLegacyProfile } from "@/services/legacy-profile.api"
import type { ProfileActivity, ProfileActivityItem } from "@/shared/lib/profile-activity"
import { OWN_PROFILE_PATH, PROFILE_SETTINGS_PATH } from "@/shared/lib/profile-routes"
import type { ProfileSettings } from "@/shared/lib/profile-settings"
import type { LocationEntity, PortfolioWork, ProjectMember, Skill, User, UserSkill } from "@/types/models"

type ProfileResponse = Pick<User, "id" | "username" | "name" | "bio" | "avatarUrl" | "createdAt"> & {
  portfolio?: PortfolioWork[]
  website?: string | null
  socialLinks?: ProfileSettings["socialLinks"]
  location?: LocationEntity | null
  userSkills?: UserSkill[]
  projectMembers?: ProjectMember[]
}

export function profileView(profile: ProfileResponse) {
  return {
    username: profile.username,
    name: profile.name,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    createdAt: profile.createdAt,
    city: profile.location?.name,
    portfolio: profile.portfolio ?? [],
    website: profile.website,
    socialLinks: profile.socialLinks,
    skills: profile.userSkills?.flatMap(({ skill }) => skill ? [skill.name] : []) ?? [],
    projects: profile.projectMembers?.flatMap(({ project }) => project
      ? [{ id: project.id, name: project.name, slogan: project.slogan }]
      : []) ?? [],
  }
}

export type ProfileView = ReturnType<typeof profileView>

export async function getPublicProfile(username: string): Promise<ProfileResponse | null> {
  const response = await authApi(`users/${encodeURIComponent(username)}`)
  if (response.status === 404) return null
  if (!response.ok) throw new Error("Could not load the public profile")
  return response.json()
}

export async function getPublicProfileActivity(profile: ProfileResponse): Promise<ProfileActivity> {
  try {
    const response = await fetch(authApiUrl(`users/${encodeURIComponent(profile.username)}/activity`), {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })
    if (response.ok) {
      const { items } = await response.json() as { items: ProfileActivityItem[] }
      if (Array.isArray(items)) return { items, complete: true }
    }
  } catch {
    // The public profile can still show known projects if the feed is unavailable.
  }

  const items = (profile.projectMembers ?? []).flatMap(({ project }): ProfileActivityItem[] => {
    if (!project) return []
    const authored = project.authorId === profile.id
    const type = authored ? "project_created" : "project_joined"
    return [{
      id: `${type}:${project.id}`,
      type,
      title: project.name,
      detail: project.slogan,
      occurredAt: authored ? project.createdAt : null,
    }]
  })
  const timestamp = (date: string | null) => date ? Date.parse(date) || 0 : 0
  items.sort((a, b) => timestamp(b.occurredAt) - timestamp(a.occurredAt))
  return { items: items.slice(0, 12), complete: false }
}

export async function requireOwnProfile(returnTo = OWN_PROFILE_PATH): Promise<ProfileResponse> {
  const login = `/login?callbackUrl=${encodeURIComponent(returnTo)}`
  const session = await auth()
  if (!session?.accessToken) redirect(login)

  const response = await authApi("auth/me", {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  })
  if (response.status === 401 || response.status === 404) redirect(login)
  if (!response.ok) throw new Error("Could not load the personal profile")
  return response.json()
}

export async function loadProfileSettings() {
  const login = `/login?callbackUrl=${encodeURIComponent(PROFILE_SETTINGS_PATH)}`
  const session = await auth()
  if (!session?.accessToken) redirect(login)

  const responses = await Promise.all([
    authApi("users/me/settings", { headers: { Authorization: `Bearer ${session.accessToken}` } }),
    authApi("skills"),
    authApi("locations"),
  ]).catch(() => null)

  if (!responses) return null
  const [settingsResponse, skillsResponse, locationsResponse] = responses
  if (settingsResponse.status === 401) redirect(login)
  const legacy = settingsResponse.status === 404
  if ((!settingsResponse.ok && !legacy) || !skillsResponse.ok || !locationsResponse.ok) return null

  const [profile, skills, locations] = await Promise.all([
    legacy ? loadLegacyProfile(session.accessToken) : settingsResponse.json() as Promise<ProfileSettings>,
    skillsResponse.json() as Promise<Skill[]>,
    locationsResponse.json() as Promise<LocationEntity[]>,
  ]).catch(() => [null, null, null] as const)
  if (profile === 401) redirect(login)
  if (!profile || !Array.isArray(skills) || !Array.isArray(locations)) return null
  return { profile, skills, locations, legacy }
}
