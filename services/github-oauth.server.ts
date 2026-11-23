import { createHash, randomBytes } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { authApi } from "./auth.api"
import { sealGithubState, validGithubSeal, verifiedGithubLink } from "./github-connection.server"
import { OWN_PROFILE_PATH, PROFILE_SETTINGS_PATH } from "@/shared/lib/profile-routes"
import type { GitHubConnection } from "@/types/github"

const callbackPath = "/api/auth/callback/github"
const stateCookie = "teamplatform-github-connect"
const statePrefix = "tp-portfolio-"
const stateLifetime = 10 * 60
type ReturnPage = typeof OWN_PROFILE_PATH | typeof PROFILE_SETTINGS_PATH
type Flow = {
  state: string
  userId: number
  verifier: string
  returnTo: ReturnPage
  redirectUri: string
  expiresAt: number
}

function origin(request: NextRequest) {
  return new URL(process.env.AUTH_URL || process.env.NEXTAUTH_URL || request.url).origin
}

function redirectBack(request: NextRequest, page: ReturnPage, status: string) {
  const url = new URL(page, origin(request))
  url.searchParams.set("github", status)
  const response = NextResponse.redirect(url)
  response.headers.set("Cache-Control", "no-store")
  response.cookies.set(stateCookie, "", cookieOptions(request, 0))
  return response
}

function cookieOptions(request: NextRequest, maxAge: number) {
  return {
    httpOnly: true,
    secure: origin(request).startsWith("https:"),
    sameSite: "lax" as const,
    path: callbackPath,
    maxAge,
  }
}

function decodeFlow(request: NextRequest): Flow | null {
  const cookie = request.cookies.get(stateCookie)?.value
  if (!cookie) return null
  try {
    const [payload, proof, extra] = cookie.split(".")
    if (!payload || !proof || extra || !validGithubSeal("github-oauth-state", payload, proof))
      return null
    const flow = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Flow
    if (
      flow.expiresAt < Date.now() ||
      (flow.returnTo !== OWN_PROFILE_PATH && flow.returnTo !== PROFILE_SETTINGS_PATH) ||
      flow.redirectUri !== new URL(callbackPath, origin(request)).href ||
      flow.state !== request.nextUrl.searchParams.get("state")
    )
      return null
    return flow
  } catch {
    return null
  }
}

export function isGithubPortfolioCallback(request: NextRequest) {
  return (
    request.nextUrl.pathname === callbackPath &&
    request.nextUrl.searchParams.get("state")?.startsWith(statePrefix)
  )
}

export async function startGithubConnection(request: NextRequest) {
  const returnTo =
    request.nextUrl.searchParams.get("from") === "settings"
      ? PROFILE_SETTINGS_PATH
      : OWN_PROFILE_PATH
  const session = await auth()
  if (!session?.accessToken || !session.appUser?.id) {
    const login = new URL("/login", origin(request))
    login.searchParams.set("callbackUrl", returnTo)
    return NextResponse.redirect(login)
  }
  const clientId = process.env.AUTH_GITHUB_ID
  if (!clientId || !process.env.AUTH_GITHUB_SECRET)
    return redirectBack(request, returnTo, "unavailable")

  const flow: Flow = {
    state: statePrefix + randomBytes(32).toString("base64url"),
    userId: session.appUser.id,
    verifier: randomBytes(32).toString("base64url"),
    returnTo,
    redirectUri: new URL(callbackPath, origin(request)).href,
    expiresAt: Date.now() + stateLifetime * 1000,
  }
  const authorize = new URL("https://github.com/login/oauth/authorize")
  authorize.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: flow.redirectUri,
    state: flow.state,
    scope: "read:user",
    code_challenge: createHash("sha256").update(flow.verifier).digest("base64url"),
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString()
  const response = NextResponse.redirect(authorize)
  response.headers.set("Cache-Control", "no-store")
  response.cookies.set(
    stateCookie,
    sealGithubState(Buffer.from(JSON.stringify(flow)).toString("base64url")),
    cookieOptions(request, stateLifetime),
  )
  return response
}

async function authorizedGithubAccount(code: string, flow: Flow): Promise<GitHubConnection> {
  const exchange = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_GITHUB_ID!,
      client_secret: process.env.AUTH_GITHUB_SECRET!,
      code,
      redirect_uri: flow.redirectUri,
      code_verifier: flow.verifier,
    }),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  })
  const token = await exchange.json()
  if (!exchange.ok || typeof token.access_token !== "string" || !token.access_token)
    throw new Error("GitHub token exchange failed")
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "TeamPlatform-github-connection",
    },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error("GitHub account lookup failed")
  const account = (await response.json()) as GitHubConnection
  return { login: account.login, id: account.id }
}

export async function finishGithubConnection(request: NextRequest) {
  const flow = decodeFlow(request)
  if (!flow) return redirectBack(request, OWN_PROFILE_PATH, "expired")
  const session = await auth()
  if (!session?.accessToken || session.appUser?.id !== flow.userId)
    return redirectBack(request, flow.returnTo, "expired")
  if (request.nextUrl.searchParams.has("error"))
    return redirectBack(request, flow.returnTo, "denied")
  const code = request.nextUrl.searchParams.get("code")
  if (!code || !process.env.AUTH_GITHUB_ID || !process.env.AUTH_GITHUB_SECRET)
    return redirectBack(request, flow.returnTo, "error")
  try {
    const account = await authorizedGithubAccount(code, flow)
    const url = verifiedGithubLink(flow.userId, account)
    const saved = await authApi("users/me/socials/GITHUB", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    })
    if (!saved.ok) throw new Error("GitHub connection was not saved")
    revalidatePath(OWN_PROFILE_PATH)
    revalidatePath(PROFILE_SETTINGS_PATH)
    revalidatePath("/[username]", "page")
    return redirectBack(request, flow.returnTo, "connected")
  } catch {
    return redirectBack(request, flow.returnTo, "error")
  }
}
