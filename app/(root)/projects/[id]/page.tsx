import { notFound } from "next/navigation"
import ProjectPage from "@/shared/components/shared/catalog/project-page"
import { parseProjectId } from "@/shared/lib/project-display"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = parseProjectId((await params).id)
  if (!id) notFound()
  return <ProjectPage id={id} />
}
