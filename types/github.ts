export interface GitHubRepository {
  id: number
  name: string
  fullName: string
  url: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  fork: boolean
  archived: boolean
  pushedAt: string | null
}

export interface GitHubActivityEvent {
  id: string
  type: string
  action?: string
  repository: string
  url: string
  createdAt: string
}

export interface GitHubPublicProfile {
  id: number
  login: string
  name: string | null
  avatarUrl: string | null
  profileUrl: string
  publicRepos: number
  followers: number
  following: number
  repositories: GitHubRepository[] | null
  events: GitHubActivityEvent[] | null
  contributions: GitHubContributionCalendar | null
  warnings: { repositories?: string; events?: string; contributions?: string }
  fetchedAt: string
}
export interface GitHubConnection {
  id: number
  login: string
}

export interface GitHubContributionDay {
  date: string
  count: number
  level: number
}

export interface GitHubContributionCalendar {
  total: number
  days: GitHubContributionDay[]
}
