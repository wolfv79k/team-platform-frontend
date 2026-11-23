import { createHmac, timingSafeEqual } from "node:crypto"
import { githubProfileUrl, githubUsername } from "@/shared/lib/github-profile"
import type { GitHubConnection } from "@/types/github"

function signature(kind: string, value: string) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("AUTH_SECRET is missing")
  return createHmac("sha256", secret).update(`${kind}:${value}`).digest("base64url")
}

export function sealGithubState(value: string) {
  return `${value}.${signature("github-oauth-state", value)}`
}

export function validGithubSeal(kind: string, value: string, proof: string) {
  const expected = Buffer.from(signature(kind, value))
  const actual = Buffer.from(proof)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

// The existing backend stores social URLs. Bind the ownership proof to the
// TeamPlatform user and the stable GitHub account ID so a copied URL cannot connect another profile.
export function verifiedGithubLink(userId: number, account: GitHubConnection) {
  const login = githubUsername(account.login)
  if (!login || !Number.isSafeInteger(account.id) || account.id <= 0)
    throw new Error("Invalid GitHub account")
  const proof = signature("github-profile", `${userId}:${account.id}:${login}`)
  return `${githubProfileUrl(login)}#tp-github-v1.${account.id}.${proof}`
}

export function readGithubConnection(
  userId: number,
  value?: string | null,
): GitHubConnection | null {
  if (!value) return null
  const login = githubUsername(value)
  if (!login) return null
  try {
    const url = new URL(value)
    const match = /^#tp-github-v1\.(\d+)\.([A-Za-z0-9_-]{43})$/.exec(url.hash)
    if (!match) return null
    const id = Number(match[1])
    if (!Number.isSafeInteger(id) || id <= 0) return null
    return validGithubSeal("github-profile", `${userId}:${id}:${login}`, match[2])
      ? { id, login }
      : null
  } catch {
    return null
  }
}
