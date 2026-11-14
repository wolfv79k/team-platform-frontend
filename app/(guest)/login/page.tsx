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
  }>
}) {
  const { callbackUrl, error, reason, registered } = await searchParams
  return (
    <EmailAuthForm
      mode="login"
      callbackUrl={safeCallback(callbackUrl)}
      oauthError={Boolean(error)}
      sessionExpired={reason === "session-expired"}
      registered={registered === "1"}
      emailCodeEnabled={process.env.AUTH_EMAIL_CODE_ENABLED === "true"}
    />
  )
}
