import { PostDetail } from "@/shared/components/shared/catalog/entity-detail"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; postId: string }>
}) {
  const { id, postId } = await params
  return <PostDetail communityId={Number(id)} postId={Number(postId)} />
}
