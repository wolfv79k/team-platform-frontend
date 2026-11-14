import { loadProfileSettings } from "@/services/users.api"
import ProfileSettingsForm from "@/shared/components/shared/profile/profile-settings-form"
import ProfileSidebar from "@/shared/components/shared/profile/profile-sidebar"
import { PROFILE_SETTINGS_PATH } from "@/shared/lib/profile-routes"

export default async function ProfileEditPage() {
  const settings = await loadProfileSettings()
  if (!settings) {
    return (
      <section className="min-w-0 flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-xl font-semibold">Не удалось загрузить настройки профиля</h1>
        <a
          href={PROFILE_SETTINGS_PATH}
          className="mt-3 inline-block text-sm text-primary underline"
        >
          Попробовать снова
        </a>
      </section>
    )
  }

  return (
    <div className="flex w-full min-w-0">
      <ProfileSettingsForm {...settings} />
      <ProfileSidebar
        username={settings.profile.username}
        name={settings.profile.name || settings.profile.username}
        avatarUrl={settings.profile.avatarUrl}
        resume={false}
      />
    </div>
  )
}
