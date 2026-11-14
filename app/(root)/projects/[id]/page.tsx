import { notFound } from "next/navigation"
import ProjectDetail from "@/shared/components/shared/catalog/project-detail"
import { catalogPreview } from "@/shared/data/catalog-preview"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = catalogPreview.projects.find((item) => String(item.id) === id)
  if (!project) notFound()
  return <ProjectDetail project={project} />
}
