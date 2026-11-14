import { EmailAuthForm } from "@/shared/components/shared/auth/email-auth-form"
import { safeCallback } from "@/shared/lib/auth-redirect"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams
  return <EmailAuthForm mode="register" callbackUrl={safeCallback(callbackUrl)} />
}
