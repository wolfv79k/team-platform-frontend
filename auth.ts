import type { User as AppUser } from "@/types/models"
import axios from "axios"
import { githubLoginForProfile } from "@/shared/lib/profile-routes"
import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import { authApiUrl, postAuth, type AuthResponse } from "@/services/auth.api"

interface GitHubEmail {
  email: string
  verified: boolean
  primary: boolean
}

class AuthAttemptError extends CredentialsSignin {
  constructor(code: string) {
    super()
    this.code = code
  }
}

async function authenticate(path: string, data: Record<string, string>, invalidCode: string) {
  let response: Response
  try {
    response = await postAuth(path, data)
  } catch {
    throw new AuthAttemptError("unavailable")
  }
  if (response.status === 400 || response.status === 401) throw new AuthAttemptError(invalidCode)
  if (path === "email-code/verify" && response.status === 409) {
    const body = await response.json().catch(() => null)
    if (body?.error === "account_missing") throw new AuthAttemptError("account_missing")
  }
  if (!response.ok) throw new AuthAttemptError("unavailable")

  const { token, user } = await response.json() as AuthResponse
  if (!token || !user?.id || !user.username) throw new AuthAttemptError("unavailable")
  return {
    id: String(user.id),
    name: user.name ?? user.username,
    email: user.email,
    image: user.avatarUrl,
    accessToken: token,
    appUser: user,
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/login", error: "/login" },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      userinfo: {
        url: "https://api.github.com/user",
        async request({ tokens }: { tokens: { access_token?: string } }) {
          const options = {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
              Accept: "application/vnd.github+json",
            },
            timeout: 10_000,
          }
          const [profile, emails] = await Promise.all([
            axios.get("https://api.github.com/user", options),
            axios.get<GitHubEmail[]>("https://api.github.com/user/emails", options),
          ]).catch(() => { throw new Error("Could not load the GitHub profile") })
          const verified = emails.data.filter((address) => address.verified)
          const email = verified.find((address) => address.primary) ?? verified[0]
          return { ...profile.data, email: email?.email ?? null }
        },
      },
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize({ email, password }) {
        if (typeof email !== "string" || !email.trim() || email.length > 255
          || typeof password !== "string" || !password || password.length > 1024) {
          throw new AuthAttemptError("invalid_password")
        }
        return authenticate("login", { email: email.trim(), password }, "invalid_password")
      },
    }),
    ...(process.env.AUTH_EMAIL_CODE_ENABLED === "true" ? [Credentials({
      id: "email-code",
      credentials: { challengeId: {}, code: {} },
      async authorize({ challengeId, code }) {
        if (typeof challengeId !== "string" || !challengeId || challengeId.length > 128
          || typeof code !== "string" || !/^\d{6}$/.test(code)) {
          throw new AuthAttemptError("invalid_code")
        }
        return authenticate("email-code/verify", { challengeId, code }, "invalid_code")
      },
    })] : []),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account?.type === "credentials" && user) {
        token.accessToken = user.accessToken
        token.appUser = user.appUser
      }

      if (account?.provider === "github") {
        const internalSecret = process.env.AUTH_INTERNAL_SECRET
        if (!internalSecret) throw new Error("AUTH_INTERNAL_SECRET is missing")
        const providerLogin = profile && "login" in profile && typeof profile.login === "string"
          ? profile.login
          : null
        const { data } = await axios.post<AuthResponse>(
          authApiUrl("auth/oauth"),
          {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            providerLogin: githubLoginForProfile(providerLogin, user?.email ?? null),
            name: user?.name ?? null,
            email: user?.email ?? null,
            image: user?.image ?? null,
          },
          {
            headers: { "X-Internal-Secret": internalSecret },
            timeout: 75_000,
          },
        ).catch(() => { throw new Error('Could not exchange the GitHub account') })
        if (!data.token || !data.user?.username) throw new Error("Invalid TeamPlatform OAuth response")
        token.accessToken = data.token
        token.appUser = data.user
      }
      return token
    },
    session({ session, token }) {
      session.accessToken = typeof token.accessToken === "string" ? token.accessToken : undefined
      session.appUser = token.appUser as AppUser | undefined
      return session
    },
  },
})
