const loginPattern = /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/i

export function githubUsername(value?: string | null): string | null {
  const input = value?.trim()
  if (!input) return null
  const handle = input.replace(/^@/, "")
  if (loginPattern.test(handle)) return handle.toLowerCase()

  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`)
    if (
      !["https:", "http:"].includes(url.protocol) ||
      !["github.com", "www.github.com"].includes(url.hostname) ||
      url.username ||
      url.password ||
      url.port
    )
      return null
    const match = /^\/([^/]+)\/?$/.exec(url.pathname)
    return match && loginPattern.test(match[1]) ? match[1].toLowerCase() : null
  } catch {
    return null
  }
}

export function githubProfileUrl(login: string) {
  return `https://github.com/${encodeURIComponent(login)}`
}

export const githubCacheSeconds = 900
