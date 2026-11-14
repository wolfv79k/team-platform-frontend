export function safeCallback(value: unknown) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001f\u007f]/.test(value)
  )
    return
  const url = new URL(value, "https://teamplatform.local")
  if (url.pathname.startsWith("//") || /^\/(?:login|register|auth|api)(?:\/|$)/i.test(url.pathname))
    return
  return url.pathname + url.search + url.hash
}

export function authCompletePath(callbackUrl?: string) {
  const callback = safeCallback(callbackUrl)
  return callback ? `/auth/complete?callbackUrl=${encodeURIComponent(callback)}` : "/auth/complete"
}
