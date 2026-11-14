export const PROFILE_USERNAME_TAKEN = "Этот ник уже занят."

export const OWN_PROFILE_PATH = "/user"
export const PROFILE_RESUME_PATH = `${OWN_PROFILE_PATH}?tab=resume`
export const PROFILE_SETTINGS_PATH = `${OWN_PROFILE_PATH}/settings/profile-edit`
export const ADD_PROJECT_PATH = `${OWN_PROFILE_PATH}/settings/add-project`

// First segments used by the app and Next.js, compared case-insensitively.
const reservedUsernames = new Set([
  "_next",
  "api",
  "auth",
  "communities",
  "events",
  "examples",
  "ideas",
  "login",
  "projects",
  "register",
  "teams",
  "user",
])

export function isReservedUsername(username: string) {
  return reservedUsernames.has(username.toLowerCase())
}

export function publicProfilePath(username: string) {
  if (
    !username ||
    username.length > 50 ||
    username === "." ||
    username === ".." ||
    /[/\\?#%\u0000-\u001f\u007f]/.test(username) ||
    isReservedUsername(username)
  )
    return null

  return `/${encodeURIComponent(username)}`
}

export function validateProfileUsername(username: string) {
  if (!/^[a-z0-9_]{3,50}$/.test(username)) {
    return "Ник должен содержать от 3 до 50 латинских букв, цифр или подчёркиваний."
  }
  if (isReservedUsername(username)) {
    return "Этот ник совпадает с адресом раздела. Выберите другой или добавьте цифру."
  }
}

export function githubLoginForProfile(login: string | null, email: string | null) {
  // Match the backend's normalization before checking for a route collision.
  const base =
    (login ?? email?.split("@")[0] ?? "user")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 40) || "user"
  return isReservedUsername(base) ? `${base}_1` : login
}
