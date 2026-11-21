import type { LocationEntity, User } from "@/types/models"

export interface AuthResponse {
  token: string
  user: User
}

export interface EmailVerification {
  email: string
  verificationEmailSent: boolean | null
}

export function authApiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is missing")
  return `${baseUrl.replace(/\/+$/, "")}/api/${path}`
}

export async function authApi(path: string, init: RequestInit = {}) {
  return fetch(authApiUrl(path), { ...init, cache: "no-store", signal: AbortSignal.timeout(75_000) })
}

export async function postAuth(path: string, details: Record<string, string | number>) {
  return authApi(`auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
  })
}

export async function loadLocations(): Promise<LocationEntity[]> {
  const response = await authApi("locations")
  if (!response.ok) throw new Error("Could not load locations")
  return response.json()
}
