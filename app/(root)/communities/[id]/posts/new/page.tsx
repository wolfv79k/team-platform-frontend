import { notFound, redirect } from "next/navigation"
import { parseProjectId } from "@/shared/lib/project-display"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = parseProjectId((await params).id)
  if (!id) notFound()
  redirect(`/communities/${id}`)
}
