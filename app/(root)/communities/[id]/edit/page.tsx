import { notFound } from "next/navigation"
import RealCollectionForm from "@/shared/components/shared/catalog/real-collection-form"
import { parseProjectId } from "@/shared/lib/project-display"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = parseProjectId((await params).id)
  if (!id) notFound()
  return <RealCollectionForm kind="communities" id={id} />
}
