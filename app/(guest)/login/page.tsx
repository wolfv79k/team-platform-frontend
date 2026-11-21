import { EmailAuthForm } from "@/shared/components/shared/auth/email-auth-form"
import { safeCallback } from "@/shared/lib/auth-redirect"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string
    error?: string
    reason?: string
    registered?: string
    verified?: string
    email?: string
  }>
}) {
  const { callbackUrl, error, reason, registered, verified, email } = await searchParams
  return (
    <EmailAuthForm
      mode="login"
      callbackUrl={safeCallback(callbackUrl)}
      oauthError={Boolean(error)}
      sessionExpired={reason === "session-expired"}
      registered={registered === "1"}
      verified={verified === "1"}
      initialEmail={typeof email === "string" ? email.slice(0, 255) : undefined}
    />
  )
}
