const project = (id: number) => `/api/projects/${id}`
const idea = (id: number) => `/api/ideas/${id}`
const community = (id: number) => `/api/communities/${id}`
const application = (id: number) => `/api/applications/${id}`

/** Routes implemented by the current backend. */
export const apiEndpoints = {
  health: "/api/health",
  skills: "/api/skills",
  roles: "/api/roles",
  locations: "/api/locations",
  auth: {
    register: "/api/auth/register",
    login: "/api/auth/login",
    verifyEmail: "/api/auth/verify-email",
    resendVerification: "/api/auth/resend-verification",
    oauth: "/api/auth/oauth",
    me: "/api/auth/me",
  },
  users: {
    detail: (username: string) => `/api/users/${encodeURIComponent(username)}`,
    updateMe: "/api/users/me",
    avatar: "/api/users/me/avatar",
    skill: (skillId: number) => `/api/users/me/skills/${skillId}`,
    social: (platform: string) => `/api/users/me/socials/${encodeURIComponent(platform)}`,
  },
  projects: {
    list: "/api/projects",
    detail: project,
    skill: (id: number, skillId: number) => `${project(id)}/skills/${skillId}`,
    role: (id: number, roleId: number) => `${project(id)}/roles/${roleId}`,
    member: (id: number, userId: number | "me") => `${project(id)}/members/${userId}`,
    applications: (id: number) => `${project(id)}/applications`,
    invitations: (id: number) => `${project(id)}/invitations`,
  },
  applications: {
    mine: "/api/users/me/applications",
    accept: (id: number) => `${application(id)}/accept`,
    decline: (id: number) => `${application(id)}/decline`,
    withdraw: application,
  },
  ideas: {
    list: "/api/ideas",
    detail: idea,
    convert: (id: number) => `${idea(id)}/project`,
  },
  communities: {
    list: "/api/communities",
    detail: community,
    membership: (id: number) => `${community(id)}/members/me`,
  },
} as const
