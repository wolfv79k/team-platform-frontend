import { notFound } from "next/navigation"
import EntityForm from "@/shared/components/shared/catalog/entity-form"
import { catalogPreview } from "@/shared/data/catalog-preview"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = catalogPreview.teams.find((item) => String(item.id) === id && item.captainId === 1)
  if (!item) notFound()
  return <EntityForm kind="teams" editId={item.id} />
}
