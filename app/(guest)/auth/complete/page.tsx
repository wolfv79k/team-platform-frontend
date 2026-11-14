import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { authApi } from "@/services/auth.api"
import { safeCallback } from "@/shared/lib/auth-redirect"
import { OWN_PROFILE_PATH } from "@/shared/lib/profile-routes"
import type { User } from "@/types/models"
import { LocationPicker } from "@/shared/components/shared/auth/location-picker"

export default async function CompleteAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl: rawCallback } = await searchParams
  const callbackUrl = safeCallback(rawCallback)
  const session = await auth()
  if (!session?.accessToken || !session.appUser) redirect("/login?reason=session-expired")
  let user = session.appUser

  // Check the saved location if the session still holds the first-login profile.
  if (user.locationId == null) {
    const response = await authApi("auth/me", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }).catch(() => null)
    if (response?.status === 401) redirect("/login?reason=session-expired")
    if (response?.ok) user = (await response.json()) as User
  }
  if (user.locationId == null) return <LocationPicker callbackUrl={callbackUrl} />
  redirect(callbackUrl ?? OWN_PROFILE_PATH)
}
