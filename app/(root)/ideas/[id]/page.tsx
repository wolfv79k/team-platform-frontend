import { notFound } from "next/navigation"
import RealCollectionDetail from "@/shared/components/shared/catalog/real-collection-detail"
import { parseProjectId } from "@/shared/lib/project-display"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = parseProjectId((await params).id)
  if (!id) notFound()
  return <RealCollectionDetail kind="ideas" id={id} />
}
