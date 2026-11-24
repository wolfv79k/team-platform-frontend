import "server-only"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { authApi } from "./auth.api"
import { AppRole } from "@/types/enums"
import type { User } from "@/types/models"

export async function getAdminAccess() {
  const session = await auth()
  if (!session?.accessToken) return { state: "guest" } as const
  try {
    const response = await authApi("auth/me", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
    if (response.status === 401 || response.status === 404) return { state: "guest" } as const
    if (response.status === 403) return { state: "denied" } as const
    if (!response.ok) return { state: "unavailable" } as const
    const account: User = await response.json()
    if (account.role !== AppRole.ADMIN || !Number.isSafeInteger(account.id) || account.id < 1)
      return { state: "denied" } as const
    return {
      state: "admin",
      id: account.id,
      name: account.name || account.username,
      token: session.accessToken,
    } as const
  } catch {
    return { state: "unavailable" } as const
  }
}

export async function requireAdmin(path: string) {
  const access = await getAdminAccess()
  if (access.state === "guest") redirect(`/login?callbackUrl=${encodeURIComponent(path)}`)
  if (access.state === "denied") redirect("/user")
  if (access.state === "unavailable") throw new Error("Не удалось проверить права администратора.")
  return access
}
