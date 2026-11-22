import { notFound } from "next/navigation"
import TeamForm from "@/shared/components/shared/catalog/team-form"
import { parseProjectId } from "@/shared/lib/project-display"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = parseProjectId((await params).id)
  if (!id) notFound()
  return <TeamForm id={id} />
}
