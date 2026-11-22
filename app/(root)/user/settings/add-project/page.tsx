import "@/app/styles/browse-layout.css"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { requireOwnProfile } from "@/services/users.api"
import { ADD_PROJECT_PATH } from "@/shared/lib/profile-routes"
import PortfolioWorkForm from "@/shared/components/shared/profile/portfolio-work-form"
import ProfileSidebar from "@/shared/components/shared/profile/profile-sidebar"

export default async function AddProjectPage() {
  const profile = await requireOwnProfile(ADD_PROJECT_PATH)
  return (
    <div className="flex min-w-0 flex-1">
      <section
        className="site-surface min-w-0 flex-1 border-x border-account-stroke"
        aria-label="Добавление работы в портфолио"
      >
        <header className="context-header">
          <Link href="/user" className="icon-btn" aria-label="Назад к портфолио">
            <ArrowLeft size={18} />
          </Link>
          <span className="crumb">Портфолио › Новая работа</span>
        </header>
        <PortfolioWorkForm viewerId={profile.id} />
      </section>
      <ProfileSidebar
        username={profile.username}
        name={profile.name || profile.username}
        avatarUrl={profile.avatarUrl}
        resume={false}
      />
    </div>
  )
}
