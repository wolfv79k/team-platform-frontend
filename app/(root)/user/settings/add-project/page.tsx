import { requireOwnProfile } from "@/services/users.api"
import { ADD_PROJECT_PATH } from "@/shared/lib/profile-routes"
import PortfolioWorkForm from "@/shared/components/shared/profile/portfolio-work-form"
import ProfileSidebar from "@/shared/components/shared/profile/profile-sidebar"

export default async function AddProjectPage() {
  const profile = await requireOwnProfile(ADD_PROJECT_PATH)
  return (
    <div className="flex min-w-0 flex-1">
      <main className="site-surface min-w-0 flex-1">
        <header className="context-header">
          <span className="crumb">Портфолио › Личная работа</span>
        </header>
        <PortfolioWorkForm />
      </main>
      <ProfileSidebar
        username={profile.username}
        name={profile.name || profile.username}
        avatarUrl={profile.avatarUrl}
        resume={false}
      />
    </div>
  )
}
