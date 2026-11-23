import { githubCacheSeconds, githubProfileUrl } from "@/shared/lib/github-profile"
import type {
  GitHubActivityEvent,
  GitHubContributionCalendar,
  GitHubContributionDay,
  GitHubPublicProfile,
  GitHubRepository,
} from "@/types/github"

interface GitHubUserResponse {
  id: number
  login: string
  name: string | null
  avatar_url: string | null
  public_repos: number
  followers: number
  following: number
}

interface GitHubRepoResponse {
  id: number
  name: string
  full_name: string
  private: boolean
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  fork: boolean
  archived: boolean
  pushed_at: string | null
}

interface GitHubEventResponse {
  id: string
  type: string
  public: boolean
  repo: { name: string }
  payload?: { action?: string }
  created_at: string
}

export class GitHubPublicError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

async function githubRequest<T>(path: string): Promise<T> {
  const token = process.env.GITHUB_PUBLIC_API_TOKEN?.trim()
  let response: Response
  try {
    response = await fetch(`https://api.github.com${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "TeamPlatform-public-github-profile",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: githubCacheSeconds },
      signal: AbortSignal.timeout(12_000),
    })
  } catch {
    throw new GitHubPublicError("Не удалось связаться с GitHub. Попробуй ещё раз.", 503)
  }
  if (!response.ok) {
    if (response.status === 404) throw new GitHubPublicError("Пользователь GitHub не найден.", 404)
    if (response.status === 403 || response.status === 429) {
      throw new GitHubPublicError("GitHub временно ограничил запросы. Попробуй немного позже.", 429)
    }
    throw new GitHubPublicError("Не удалось получить данные GitHub.", 502)
  }
  return response.json() as Promise<T>
}

function repositoryUrl(fullName: string) {
  return `https://github.com/${fullName.split("/").map(encodeURIComponent).join("/")}`
}

async function recentRepositories(login: string): Promise<GitHubRepository[]> {
  const repos = await githubRequest<GitHubRepoResponse[]>(
    `/users/${login}/repos?type=owner&sort=pushed&direction=desc&per_page=6`,
  )
  return repos
    .filter((repo) => !repo.private)
    .map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      url: repositoryUrl(repo.full_name),
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      fork: repo.fork,
      archived: repo.archived,
      pushedAt: repo.pushed_at,
    }))
}

async function recentEvents(login: string): Promise<GitHubActivityEvent[]> {
  const events = await githubRequest<GitHubEventResponse[]>(
    `/users/${login}/events/public?per_page=100`,
  )
  return events
    .filter(
      (event) => event.public && event.repo?.name && Number.isFinite(Date.parse(event.created_at)),
    )
    .map((event) => ({
      id: event.id,
      type: event.type,
      action: event.payload?.action,
      repository: event.repo.name,
      url: repositoryUrl(event.repo.name),
      createdAt: event.created_at,
    }))
}

function message(reason: unknown) {
  return reason instanceof GitHubPublicError ? reason.message : "Не удалось получить данные GitHub."
}

// This is the calendar that GitHub renders publicly, including any private
// contribution counts the account owner has chosen to make visible.
async function publicContributions(login: string): Promise<GitHubContributionCalendar> {
  const response = await fetch(`https://github.com/users/${login}/contributions`, {
    headers: { "User-Agent": "TeamPlatform-public-profile", "Accept-Language": "en-US,en;q=0.9" },
    next: { revalidate: githubCacheSeconds },
    signal: AbortSignal.timeout(12_000),
  })
  if (!response.ok) throw new GitHubPublicError("Не удалось загрузить календарь GitHub.", 502)
  const html = await response.text()
  const counts = new Map<string, number>()
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([^<]*)<\/tool-tip>/gi)) {
    const id = /\bfor="(contribution-day-component-[^"]+)"/.exec(match[1])?.[1]
    const label = /^\s*(No|[\d,]+) contributions?\b/i.exec(match[2])?.[1]
    if (id && label)
      counts.set(id, label.toLowerCase() === "no" ? 0 : Number(label.replaceAll(",", "")))
  }
  const days: GitHubContributionDay[] = []
  for (const match of html.matchAll(/<td\b[^>]*\bdata-date="\d{4}-\d{2}-\d{2}"[^>]*>/gi)) {
    const cell = match[0]
    const date = /\bdata-date="([^"]+)"/.exec(cell)?.[1]
    const id = /\bid="(contribution-day-component-[^"]+)"/.exec(cell)?.[1]
    const level = /\bdata-level="([0-4])"/.exec(cell)?.[1]
    const count = id && counts.get(id)
    if (date && level !== undefined && typeof count === "number" && Number.isSafeInteger(count)) {
      days.push({ date, count, level: Number(level) })
    }
  }
  days.sort((a, b) => a.date.localeCompare(b.date))
  // Reject incomplete or changed upstream markup rather than showing false zeros.
  if (
    days.length < 365 ||
    days.length > 366 ||
    new Set(days.map((day) => day.date)).size !== days.length
  )
    throw new GitHubPublicError("Календарь GitHub временно недоступен.", 502)
  return { total: days.reduce((sum, day) => sum + day.count, 0), days }
}

export async function loadGitHubPublicProfile(login: string): Promise<GitHubPublicProfile> {
  const account = await githubRequest<GitHubUserResponse>(`/users/${encodeURIComponent(login)}`)
  const canonical = encodeURIComponent(account.login.toLowerCase())
  const [repos, events, contributions] = await Promise.allSettled([
    recentRepositories(canonical),
    recentEvents(canonical),
    publicContributions(canonical),
  ])
  return {
    id: account.id,
    login: account.login,
    name: account.name,
    avatarUrl: account.avatar_url,
    profileUrl: githubProfileUrl(account.login),
    publicRepos: account.public_repos,
    followers: account.followers,
    following: account.following,
    repositories: repos.status === "fulfilled" ? repos.value : null,
    events: events.status === "fulfilled" ? events.value : null,
    contributions: contributions.status === "fulfilled" ? contributions.value : null,
    warnings: {
      ...(repos.status === "rejected" ? { repositories: message(repos.reason) } : {}),
      ...(events.status === "rejected" ? { events: message(events.reason) } : {}),
      ...(contributions.status === "rejected"
        ? { contributions: message(contributions.reason) }
        : {}),
    },
    fetchedAt: new Date().toISOString(),
  }
}
