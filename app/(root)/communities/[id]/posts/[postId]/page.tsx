import { notFound, redirect } from "next/navigation"
import { parseProjectId } from "@/shared/lib/project-display"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; postId: string }>
}) {
  const { id, postId } = await params
  const communityId = parseProjectId(id)
  if (!communityId || !parseProjectId(postId)) notFound()
  redirect(`/communities/${communityId}`)
}
