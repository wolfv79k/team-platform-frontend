import type {
  AppRole,
  SkillLevel,
  ProjectStatus,
  ApplicationType,
  ApplicationStatus,
  CommunityRole,
  NotificationType,
} from './enums'

// USER

export interface User {
  id: number
  email: string
  username: string
  name: string | null
  bio: string | null
  avatarUrl: string | null
  role: AppRole
  createdAt: string
  locationId: number

  location?: LocationEntity
  userSkills?: UserSkill[]
  authoredProjects?: Project[]
  projectMembers?: ProjectMember[]
  projectApplications?: ProjectApplication[]
  ideas?: Idea[]
  createdCommunities?: Community[]
  communityMembers?: CommunityMember[]
  posts?: Post[]
  comments?: Comment[]
  captainedTeams?: Team[]
  teamMembers?: TeamMember[]
  teamApplications?: TeamApplication[]
  notifications?: Notification[]
}

// Только для внутреннего использования на бэкенде.
// Не передавать клиенту.
export type UserRecord = User & {
  passwordHash: string
}

// SKILL

export interface Skill {
  id: number
  name: string

  userSkills?: UserSkill[]
  projectSkills?: ProjectSkill[]
  teamSkills?: TeamSkill[]
}

// ROLE

export interface Role {
  id: number
  name: string

  projectMembers?: ProjectMember[]
  projectApplications?: ProjectApplication[]
  projectOpenRoles?: ProjectOpenRole[]
}

// LOCATION

export interface LocationEntity {
  id: number
  name: string

  users?: User[]
}

// USER SKILL

export interface UserSkill {
  userId: number
  skillId: number
  skillLevel: SkillLevel

  user?: User
  skill?: Skill
}

// PROJECT

export interface Project {
  id: number
  name: string
  description: string | null
  slogan: string | null
  status: ProjectStatus
  authorId: number
  createdAt: string
  projectUrl: string | null
  logoUrl: string | null
  videoUrl: string | null
  coverImageUrls: string[]
  partners: string[]

  author?: User
  projectMembers?: ProjectMember[]
  projectSkills?: ProjectSkill[]
  projectApplications?: ProjectApplication[]
  idea?: Idea | null
  projectOpenRoles?: ProjectOpenRole[]
}

// PROJECT MEMBER

export interface ProjectMember {
  userId: number
  roleId: number
  projectId: number
  contribution: string | null

  user?: User
  role?: Role
  project?: Project
}

// PROJECT SKILL

export interface ProjectSkill {
  projectId: number
  skillId: number
  skillLevel: SkillLevel

  project?: Project
  skill?: Skill
}

// PROJECT OPEN ROLE

export interface ProjectOpenRole {
  projectId: number
  roleId: number
  slots: number

  project?: Project
  role?: Role
}

// PROJECT APPLICATION

export interface ProjectApplication {
  id: number
  userId: number
  projectId: number
  roleId: number
  type: ApplicationType
  message: string | null
  status: ApplicationStatus
  createdAt: string

  user?: User
  project?: Project
  role?: Role
}

// IDEA

export interface Idea {
  id: number
  name: string
  authorId: number
  description: string | null
  projectId: number | null
  createdAt: string

  author?: User
  project?: Project | null
}

// COMMUNITY

export interface Community {
  id: number
  name: string
  description: string | null
  creatorId: number
  createdAt: string

  creator?: User
  communityMembers?: CommunityMember[]
  posts?: Post[]
}

// COMMUNITY MEMBER

export interface CommunityMember {
  userId: number
  role: CommunityRole
  communityId: number

  user?: User
  community?: Community
}

// POST

export interface Post {
  id: number
  authorId: number
  communityId: number
  title: string | null
  imageUrl: string | null
  text: string
  createdAt: string

  author?: User
  community?: Community
  comments?: Comment[]
}

// COMMENT

export interface Comment {
  id: number
  authorId: number
  postId: number
  text: string
  createdAt: string

  author?: User
  post?: Post
}

// TEAM

export interface Team {
  id: number
  name: string
  description: string | null
  captainId: number
  createdAt: string

  captain?: User
  teamMembers?: TeamMember[]
  teamSkills?: TeamSkill[]
  hackathonTeams?: HackathonTeam[]
  teamApplications?: TeamApplication[]
}

// TEAM MEMBER

export interface TeamMember {
  userId: number
  teamId: number
  contribution: string | null

  user?: User
  team?: Team
}

// TEAM SKILL

export interface TeamSkill {
  teamId: number
  skillId: number
  skillLevel: SkillLevel

  team?: Team
  skill?: Skill
}

// HACKATHON

export interface Hackathon {
  id: number
  name: string
  description: string | null
  startDate: string
  endDate: string
  location: string | null
  organizerUrl: string | null

  hackathonTeams?: HackathonTeam[]
}

// HACKATHON TEAM

export interface HackathonTeam {
  teamId: number
  hackathonId: number

  team?: Team
  hackathon?: Hackathon
}

// TEAM APPLICATION

export interface TeamApplication {
  id: number
  userId: number
  teamId: number
  type: ApplicationType
  message: string | null
  status: ApplicationStatus
  createdAt: string

  user?: User
  team?: Team
}

// NOTIFICATION

export interface Notification {
  id: number
  recipientId: number
  entityId: number
  type: NotificationType
  text: string | null
  isRead: boolean
  createdAt: string

  recipient?: User
}