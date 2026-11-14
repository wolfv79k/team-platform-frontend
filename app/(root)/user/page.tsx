import { getPublicProfile, profileView, requireOwnProfile } from "@/services/users.api"
import PersonalProfile from "@/shared/components/shared/profile/personal-profile"

export default async function OwnProfilePage() {
  const profile = await requireOwnProfile()
  const details = await getPublicProfile(profile.username)
  const view = profileView(details?.id === profile.id ? details : profile)

  return <PersonalProfile profile={view} />
}
