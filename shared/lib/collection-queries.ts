import { useQuery } from "@tanstack/react-query"
import { ideasApi } from "@/services/ideas.api"
import { communitiesApi } from "@/services/communities.api"
import type { CommunityView, IdeaView, PageParams, PageResponse } from "@/types/api"

export type CollectionKind = "ideas" | "communities"

export const collectionKeys = {
  catalog: (kind: CollectionKind) => [kind, "catalog"] as const,
  detail: (kind: CollectionKind, id: number) => [kind, "detail", id] as const,
}

export function useCollectionDetail(kind: CollectionKind, id?: number) {
  return useQuery<IdeaView | CommunityView>({
    queryKey: collectionKeys.detail(kind, id ?? 0),
    queryFn: () => (kind === "ideas" ? ideasApi.get(id!) : communitiesApi.get(id!)),
    enabled: id !== undefined,
  })
}

/** Backend supports pagination only for ideas and has no ownership filter for communities. */
export async function allCollectionPages<T extends { id: number }>(
  fetchPage: (params: PageParams) => Promise<PageResponse<T>>,
): Promise<PageResponse<T>> {
  const items = new Map<number, T>()
  let page = 1
  for (;;) {
    const response = await fetchPage({ page, limit: 50 })
    response.items.forEach((item) => items.set(item.id, item))
    if (!response.items.length || page * response.limit >= response.total) break
    page += 1
  }
  return { items: [...items.values()], total: items.size, page: 1, limit: 50 }
}
