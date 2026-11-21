const resendInterval = 60_000
const storagePrefix = "teamplatform:email-verification:"

export function rememberVerificationRequest(email: string) {
  const deadline = Date.now() + resendInterval
  try {
    sessionStorage.setItem(storagePrefix + email, String(deadline))
  } catch {
    // The open dialog still keeps its cooldown when browser storage is unavailable.
  }
  return deadline
}

export function verificationResendDeadline(email: string) {
  try {
    const deadline = Number(sessionStorage.getItem(storagePrefix + email))
    return Number.isFinite(deadline) ? Math.min(deadline, Date.now() + resendInterval) : 0
  } catch {
    return 0
  }
}

export function clearVerificationRequest(email: string) {
  try {
    sessionStorage.removeItem(storagePrefix + email)
  } catch {
    // Confirming the email does not depend on browser storage.
  }
}
