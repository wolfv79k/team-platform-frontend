import type { ProjectStatus, SkillLevel } from "./enums"
import type {
  Community,
  CommunityMember,
  Idea,
  Project,
  ProjectApplication,
  ProjectMember,
  ProjectOpenRole,
  ProjectSkill,
  Role,
  Skill,
  User,
} from "./models"

export interface PageParams {
  page?: number
  limit?: number
}
export interface PageResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

/** Public relations are deliberately not typed as the private account response. */
export type PublicUser = Pick<
  User,
  "id" | "username" | "name" | "avatarUrl" | "bio" | "createdAt" | "role" | "locationId" | "websiteUrl" | "resumeUrl"
>
export type ProjectSkillView = ProjectSkill & { skill: Skill }
export type ProjectRoleView = ProjectOpenRole & { role: Role }
export type ProjectMemberView = Omit<ProjectMember, "user"> & { user: PublicUser; role: Role }
export type ProjectRecord = Omit<
  Project,
  | "author"
  | "projectMembers"
  | "projectSkills"
  | "projectOpenRoles"
  | "projectApplications"
  | "idea"
>
export type ProjectListItem = ProjectRecord & {
  author: PublicUser
  projectSkills: ProjectSkillView[]
  projectOpenRoles: ProjectRoleView[]
}
export type CreatedProject = ProjectRecord & { projectMembers: ProjectMemberView[] }
export type ProjectDetail = ProjectListItem & {
  projectMembers: ProjectMemberView[]
  idea?: Pick<Idea, "id" | "name" | "authorId" | "projectId" | "description" | "createdAt"> | null
}
export type ProjectApplicationView = Omit<ProjectApplication, "project" | "user" | "role"> & {
  project: Pick<Project, "id" | "name" | "status" | "logoUrl" | "authorId">
  user: PublicUser
  role: Role
}
export type IdeaView = Omit<Idea, "author" | "project"> & { author: PublicUser; project: ProjectRecord | null }
type CommunityRecord = Omit<Community, "creator" | "communityMembers" | "posts">
export type CommunityView = CommunityRecord & { creator: PublicUser; membersCount: number }
export type CreatedCommunity = CommunityRecord & { communityMembers: (Omit<CommunityMember, "user" | "community"> & { user: PublicUser })[] }
export interface ProjectFilters extends PageParams {
  status?: ProjectStatus
  skillId?: number
  roleId?: number
  search?: string
}
export interface ProjectFields {
  name: string
  description?: string
  slogan?: string
  projectUrl?: string
  videoUrl?: string
  partners?: string[]
}
export interface CreateProjectInput extends ProjectFields {
  roleId: number
}
export type UpdateProjectInput = Partial<ProjectFields> & { status?: ProjectStatus }
export type SetSkillInput = { skillLevel: SkillLevel }
export type SetRoleInput = { slots: number }
