import { notFound } from "next/navigation"
import { getPublicProfile, getPublicProfileActivity, profileView } from "@/services/users.api"
import PublicProfile from "@/shared/components/shared/profile/public-profile"
import { BrowseLayout } from "@/shared/components/shared/layout/browse-layout"
import { publicProfilePath } from "@/shared/lib/profile-routes"

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  if (!publicProfilePath(username)) notFound()

  const profile = await getPublicProfile(username)
  if (!profile) notFound()

  const feed = await getPublicProfileActivity(profile)
  return (
    <BrowseLayout title={`Профиль › ${profile.username}`}>
      <PublicProfile
        profile={profileView(profile)}
        posts={feed.items.filter((item) => item.type === "post")}
      />
    </BrowseLayout>
  )
}
