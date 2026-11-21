"use client"

import "@/app/styles/forms.css"
import "@/app/styles/profile-settings.css"
import "@/app/styles/browse-layout.css"

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FormEvent,
} from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, ArrowLeft, UserRound } from "lucide-react"
import { ProfileSkillsField } from "./profile-skills-field"
import { ProfileSocialFields } from "./profile-social-fields"
import { checkProfileUsername, saveProfile } from "@/app/actions/profile"
import { useProfileSidebarStore } from "@/shared/store/profile-sidebar.store"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { validateProfileUsername } from "@/shared/lib/profile-routes"
import {
  avatarError,
  avatarTypes,
  socialFields,
  webLink,
  type ProfileSettings,
} from "@/shared/lib/profile-settings"
import type { LocationEntity, Skill } from "@/types/models"

const subscribeToStorage = (notify: () => void) => {
  window.addEventListener("storage", notify)
  return () => window.removeEventListener("storage", notify)
}

function initialFields(profile: ProfileSettings) {
  const [legacyFirstName = "", ...legacyLastName] = (profile.name ?? "").trim().split(/\s+/)
  const hasSeparateNames = profile.firstName !== null || profile.lastName !== null
  return {
    username: profile.username,
    firstName: hasSeparateNames ? (profile.firstName ?? "") : legacyFirstName,
    lastName: hasSeparateNames ? (profile.lastName ?? "") : legacyLastName.join(" "),
    bio: profile.bio ?? "",
    location: profile.locationId?.toString() ?? "",
    gender: profile.gender ?? "",
    website: profile.website ?? "",
    resume: profile.resume ?? "",
    telegram: profile.socialLinks?.telegram ?? "",
    linkedin: profile.socialLinks?.linkedin ?? "",
    vk: profile.socialLinks?.vk ?? "",
    behance: profile.socialLinks?.behance ?? "",
    discord: profile.socialLinks?.discord ?? "",
    github: profile.socialLinks?.github ?? "",
    other: profile.socialLinks?.other ?? "",
  }
}

export default function ProfileSettingsForm({
  profile,
  skills,
  locations,
  legacy,
}: {
  profile: ProfileSettings
  skills: Skill[]
  locations: LocationEntity[]
  legacy: boolean
}) {
  const [savedProfile, setSavedProfile] = useState(profile)
  const [genderDraft, setGenderDraft] = useState<string | null>(null)
  const genderKey = legacy ? `teamplatform:profile:${profile.id}:gender` : null
  const localGender = useSyncExternalStore(
    subscribeToStorage,
    () => {
      try {
        const value = genderKey && localStorage.getItem(genderKey)
        return value === "male" || value === "female" ? value : ""
      } catch {
        return ""
      }
    },
    () => "",
  )
  const [fields, setFields] = useState(() => initialFields(profile))
  const [selectedSkills, setSelectedSkills] = useState(() =>
    profile.userSkills.map(({ skillId }) => skillId),
  )
  const [usernameFeedback, setUsernameFeedback] = useState<{
    value: string
    message: string
  } | null>(null)
  const usernameInput = useRef<HTMLInputElement>(null)
  const usernameCheck = useRef(0)
  const [saving, setSaving] = useState(false)
  const { isOpen, setIsOpen } = useProfileSidebarStore()
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!avatarPreview) return
    return () => URL.revokeObjectURL(avatarPreview)
  }, [avatarPreview])

  const savedAvatar = savedProfile.avatarUrl
  const avatar =
    avatarPreview ??
    (savedAvatar && /^https?:\/\//i.test(savedAvatar) ? savedAvatar : "/Avatar.jpg")
  const usernameError =
    usernameFeedback?.value === fields.username ? usernameFeedback.message : undefined

  function showUsernameError(value: string, message: string) {
    setUsernameFeedback({ value, message })
  }

  async function checkUsername() {
    const value = fields.username
    if (value === savedProfile.username || usernameError || saving) return
    const error = validateProfileUsername(value.trim().toLowerCase())
    if (error) {
      showUsernameError(value, error)
      return
    }
    const check = ++usernameCheck.current
    try {
      const result = await checkProfileUsername(value)
      if (check === usernameCheck.current && result?.usernameError) {
        showUsernameError(value, result.usernameError)
      }
    } catch {
      // The save action can still report a conflict.
    }
  }

  function updateField(key: keyof typeof fields, value: string) {
    setFields((previous) => ({ ...previous, [key]: value }))
    setNotice("")
  }

  function toggleSkill(id: number) {
    setSelectedSkills((previous) => {
      if (previous.includes(id)) return previous.filter((selected) => selected !== id)
      return previous.length < 10 ? [...previous, id] : previous
    })
    setNotice("")
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    const message = avatarError(file)
    if (message) {
      setError(message)
      return
    }
    setError("")
    setNotice("")
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    ++usernameCheck.current
    setError("")
    setNotice("")

    const username =
      fields.username === savedProfile.username
        ? fields.username
        : fields.username.trim().toLowerCase()
    const invalidUsername =
      username === savedProfile.username ? undefined : validateProfileUsername(username)
    if (invalidUsername) {
      showUsernameError(fields.username, invalidUsername)
      usernameInput.current?.focus()
      return
    }

    const { location, firstName, lastName, bio, website, resume } = fields
    const gender = genderKey ? (genderDraft ?? localGender) : fields.gender
    const data = new FormData()
    data.set(
      "settings",
      JSON.stringify({
        username,
        firstName,
        lastName,
        bio,
        gender: genderKey ? "" : gender,
        locationId: location ? Number(location) : null,
        website: webLink(website),
        resume: webLink(resume),
        socialLinks: Object.fromEntries(socialFields.map(({ key }) => [key, webLink(fields[key])])),
        skillIds: selectedSkills,
      }),
    )
    if (avatarFile) data.set("avatar", avatarFile)

    setSaving(true)
    try {
      const result = await saveProfile(data)
      if (result.redirectTo) {
        window.location.assign(result.redirectTo)
        return
      }
      if (result.usernameError) {
        showUsernameError(fields.username, result.usernameError)
        usernameInput.current?.scrollIntoView({ block: "center" })
        return
      }
      if (!result.profile) {
        setError(result.error ?? "Не удалось сохранить изменения.")
        return
      }

      setUsernameFeedback(null)
      setSavedProfile(result.profile)
      setFields(initialFields(result.profile))
      setSelectedSkills(result.profile.userSkills.map(({ skillId }) => skillId))
      setAvatarFile(null)
      setAvatarPreview(null)
      if (genderKey) {
        try {
          if (gender) localStorage.setItem(genderKey, gender)
          else localStorage.removeItem(genderKey)
        } catch {
          setError("Профиль сохранён, но браузер не смог запомнить выбранный пол.")
          return
        }
      }
      setNotice("Изменения сохранены.")
    } catch {
      setError("Не удалось сохранить изменения. Попробуйте ещё раз.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="site-surface profile-settings center-column min-w-0 flex-1">
      <header className="context-header">
        <div className="flex items-center gap-2 text-subtle">
          <Link
            href="/user"
            className="flex p-1 items-center justify-center rounded border border-stroke"
          >
            <ArrowLeft size={16} />
          </Link>
          Настройки
        </div>

        <span className="text-subtle">›</span>

        <span className="font-medium text-ink">Профиль</span>
        <button
          type="button"
          className="profile-rail-toggle ml-auto grid place-items-center lg:hidden"
          aria-label="Открыть меню профиля"
          aria-controls="profile-sidebar"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu size={18} />
        </button>
      </header>

      {legacy && (
        <p className="settings-note border-b border-stroke px-4 py-3 sm:px-6">
          Пол сохраняется в этом браузере.
        </p>
      )}
      <form className="edit-form" onSubmit={submit}>
        <fieldset disabled={saving} className="min-w-0">
          {/* Базовая информация */}
          <section className="form-section">
            <div className="settings-section-title">
              <UserRound size={13} aria-hidden="true" />
              <h2>Базовая информация</h2>
            </div>

            {/* Аватар */}
            <div id="profile-avatar" className="mb-4 flex items-center gap-3">
              <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-interaction">
                <Image
                  src={avatar}
                  alt="Аватар профиля"
                  fill
                  sizes="44px"
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="min-w-0">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept={avatarTypes.join(",")}
                  className="hidden"
                  onChange={handleAvatarChange}
                />

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="settings-link"
                >
                  Обновить аватар
                </button>

                <p className="mt-1 text-micro text-subtle">Рекомендуемый размер: 400 × 400 px</p>
              </div>
            </div>

            <div className="mb-5">
              <label
                htmlFor="profile-username"
                className="mb-1.5 block text-xs font-medium text-ink"
              >
                Ник
              </label>

              <Input
                id="profile-username"
                ref={usernameInput}
                value={fields.username}
                onChange={(event) => {
                  ++usernameCheck.current
                  setUsernameFeedback(null)
                  updateField("username", event.target.value)
                }}
                onBlur={checkUsername}
                aria-invalid={Boolean(usernameError)}
                aria-describedby={usernameError ? "profile-username-error" : undefined}
                name="username"
                autoComplete="username"
                aria-required="true"
                maxLength={50}
                className="h-9 border-stroke text-xs shadow-none focus-visible:ring-action"
              />
              {usernameError && (
                <p
                  id="profile-username-error"
                  role="alert"
                  className="mt-1.5 text-xs text-destructive"
                >
                  {usernameError}
                </p>
              )}
            </div>

            {/* Имя и фамилия */}
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="profile-first-name"
                  className="mb-1.5 block text-xs font-medium text-ink"
                >
                  Имя
                </label>

                <Input
                  id="profile-first-name"
                  autoComplete="given-name"
                  maxLength={100}
                  value={fields.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  placeholder="Ваше имя"
                  className="h-9 border-stroke text-xs shadow-none focus-visible:ring-action"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-last-name"
                  className="mb-1.5 block text-xs font-medium text-ink"
                >
                  Фамилия
                </label>

                <Input
                  id="profile-last-name"
                  autoComplete="family-name"
                  maxLength={100}
                  value={fields.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  placeholder="Ваша фамилия"
                  className="h-9 border-stroke text-xs shadow-none focus-visible:ring-action"
                />
              </div>
            </div>

            {/* Краткое описание */}
            <div className="mb-1">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor="profile-bio" className="text-xs font-medium text-ink">
                  О себе
                </label>

                <span className="text-micro tabular-nums text-subtle">{fields.bio.length}/120</span>
              </div>

              <textarea
                id="profile-bio"
                value={fields.bio}
                onChange={(event) => updateField("bio", event.target.value.slice(0, 120))}
                maxLength={120}
                rows={3}
                placeholder="Расскажите немного о себе"
                className="w-full resize-y rounded-md border border-stroke bg-control px-3 py-2 text-xs text-ink outline-none transition-shadow placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-0"
              />

              <p className="mt-1 text-caption text-link-accent">
                Первое, что увидят пользователи в вашем профиле
              </p>
            </div>

            {/* Локация и пол */}
            <div className="mb-3 mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="profile-location"
                  className="mb-1.5 block text-xs font-medium text-ink"
                >
                  Локация
                </label>

                <select
                  id="profile-location"
                  value={fields.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  className="h-9 w-full rounded-md border border-stroke bg-control px-2 text-xs text-subtle outline-none focus-visible:ring-2 focus-visible:ring-action"
                >
                  <option value="" disabled={legacy && savedProfile.locationId !== null}>
                    Не указан
                  </option>
                  {locations.map(({ id, name }) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="profile-gender"
                  className="mb-1.5 block text-xs font-medium text-ink"
                >
                  Пол
                </label>

                <select
                  id="profile-gender"
                  value={genderKey ? (genderDraft ?? localGender) : fields.gender}
                  onChange={(event) => {
                    if (genderKey) {
                      setGenderDraft(event.target.value)
                      setNotice("")
                    } else {
                      updateField("gender", event.target.value)
                    }
                  }}
                  className="h-9 w-full rounded-md border border-stroke bg-control px-2 text-xs text-subtle outline-none focus-visible:ring-2 focus-visible:ring-action"
                >
                  <option value="">Предпочитаю не указывать</option>
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(
                [
                  { key: "website", label: "Ссылка на сайт" },
                  { key: "resume", label: "Ссылка на резюме" },
                ] as const
              ).map(({ key, label }) => (
                <div key={key}>
                  <label
                    htmlFor={`profile-${key}`}
                    className="mb-1.5 block text-xs font-medium text-ink"
                  >
                    {label}
                  </label>
                  <Input
                    id={`profile-${key}`}
                    inputMode="url"
                    maxLength={500}
                    value={fields[key]}
                    onChange={(event) => updateField(key, event.target.value)}
                    placeholder="https://..."
                    className="h-9 border-stroke text-xs shadow-none focus-visible:ring-action"
                  />
                </div>
              ))}
            </div>
          </section>

          <ProfileSkillsField
            skills={skills}
            selectedSkills={selectedSkills}
            toggleSkill={toggleSkill}
            saving={saving}
          />
          <ProfileSocialFields fields={fields} onChange={updateField} disabled={saving} />
        </fieldset>
        <footer className="form-footer">
          {error && (
            <p role="alert" className="mr-auto text-sm text-destructive">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="mr-auto text-sm text-subtle">
              {notice}
            </p>
          )}
          <Link href="/user" className="btn quiet">
            Отмена
          </Link>
          <Button type="submit" disabled={saving} className="btn primary">
            {saving ? "Сохраняем…" : "Сохранить изменения"}
          </Button>
        </footer>
      </form>
    </main>
  )
}
