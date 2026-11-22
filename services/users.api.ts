import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { authApi } from "@/services/auth.api"
import { loadLegacyProfile } from "@/services/legacy-profile.api"
import type { ProfileActivity, ProfileActivityItem } from "@/shared/lib/profile-activity"
import { OWN_PROFILE_PATH, PROFILE_SETTINGS_PATH } from "@/shared/lib/profile-routes"
import { profileSocialLinks, type ProfileSettings } from "@/shared/lib/profile-settings"
import { httpUrl } from "@/shared/lib/project-display"
import type {
  LocationEntity,
  PortfolioWork,
  ProjectMember,
  Skill,
  User,
  UserSkill,
} from "@/types/models"

type ProfileResponse = Pick<
  User,
  "id" | "username" | "name" | "bio" | "avatarUrl" | "createdAt"
> & {
  portfolio?: PortfolioWork[]
  website?: string | null
  websiteUrl?: string | null
  resumeUrl?: string | null
  socialLinks?: ProfileSettings["socialLinks"] | User["socialLinks"]
  location?: LocationEntity | null
  userSkills?: UserSkill[]
  projectMembers?: ProjectMember[]
}

export function profileView(profile: ProfileResponse) {
  const memberships = profile.projectMembers ?? []
  return {
    username: profile.username,
    name: profile.name,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    createdAt: profile.createdAt,
    city: profile.location?.name,
    portfolio: profile.portfolio ?? memberships.flatMap(({ project, contribution }) =>
      project ? [{
        id: project.id,
        projectId: project.id,
        title: project.name,
        description: project.slogan ?? project.description ?? undefined,
        contribution: contribution ?? undefined,
        coverUrl: httpUrl(project.coverImageUrls?.[0]) ?? httpUrl(project.logoUrl),
        url: httpUrl(project.projectUrl),
      }] : [],
    ),
    website: profile.websiteUrl ?? profile.website,
    resume: profile.resumeUrl,
    socialLinks: profileSocialLinks(profile.socialLinks),
    skills: profile.userSkills?.flatMap(({ skill }) => (skill ? [skill.name] : [])) ?? [],
    skillDetails: profile.userSkills?.flatMap(({ skill, skillLevel }) => skill ? [{ name: skill.name, level: skillLevel }] : []) ?? [],
    projects:
      profile.projectMembers?.flatMap(({ project }) =>
        project ? [{ id: project.id, name: project.name, slogan: project.slogan }] : [],
      ) ?? [],
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
  const items = (profile.projectMembers ?? []).flatMap(({ project }): ProfileActivityItem[] => {
    if (!project) return []
    const authored = project.authorId === profile.id
    const type = authored ? "project_created" : "project_joined"
    return [
      {
        id: `${type}:${project.id}`,
        type,
        title: project.name,
        detail: project.slogan,
        occurredAt: authored ? project.createdAt : null,
      },
    ]
  })
  const timestamp = (date: string | null) => (date ? Date.parse(date) || 0 : 0)
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
  const profile: ProfileResponse = await response.json()
  if (profile.projectMembers) return profile
  // Older backend deployments return only account fields from /auth/me.
  const publicProfile = await getPublicProfile(profile.username)
  return publicProfile ? { ...profile, ...publicProfile } : profile
}

export async function loadProfileSettings() {
  const login = `/login?callbackUrl=${encodeURIComponent(PROFILE_SETTINGS_PATH)}`
  const session = await auth()
  if (!session?.accessToken) redirect(login)

  const responses = await Promise.all([
    loadLegacyProfile(session.accessToken),
    authApi("skills"),
    authApi("locations"),
  ]).catch(() => null)

  if (!responses) return null
  const [profile, skillsResponse, locationsResponse] = responses
  if (profile === 401) redirect(login)
  if (!profile || !skillsResponse.ok || !locationsResponse.ok) return null

  const [skills, locations] = await Promise.all([
    skillsResponse.json() as Promise<Skill[]>,
    locationsResponse.json() as Promise<LocationEntity[]>,
  ]).catch(() => [null, null] as const)
  if (!Array.isArray(skills) || !Array.isArray(locations)) return null
  return { profile, skills, locations, legacy: true }
}
