import { notFound } from "next/navigation"
import TeamPage from "@/shared/components/shared/catalog/team-page"
import { parseProjectId } from "@/shared/lib/project-display"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = parseProjectId((await params).id)
  if (!id) notFound()
  return <TeamPage id={id} />
}
