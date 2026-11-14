import { notFound } from "next/navigation"
import EntityForm from "@/shared/components/shared/catalog/entity-form"
import { catalogPreview } from "@/shared/data/catalog-preview"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const community = catalogPreview.communities.find(
    (item) => String(item.id) === id && item.members.includes(1),
  )
  if (!community) notFound()
  return <EntityForm kind="post" communityId={community.id} />
}
