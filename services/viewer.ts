import { auth } from "@/auth"
import { authApiUrl } from "@/services/auth.api"
import type { User } from "@/types/models"

export type Viewer = { id: number; username: string; name: string; avatarUrl: string | null; role?: User["role"] }

export async function getViewer(): Promise<Viewer | null> {
  const session = await auth()
  if (!session?.accessToken || !session.appUser) return null

  let account = session.appUser
  try {
    const response = await fetch(authApiUrl("auth/me"), {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(3500),
    })
    if (response.status === 401 || response.status === 404) return null
    if (response.ok) account = await response.json() as User
  } catch {
    // Use the session profile while the API is unavailable.
  }

  return { id: account.id, username: account.username, name: account.name || account.username, avatarUrl: account.avatarUrl, role: account.role }
}
