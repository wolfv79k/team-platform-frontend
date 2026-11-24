import { useQuery } from "@tanstack/react-query"
import { projectsApi } from "./projects.api"
import { communitiesApi } from "./communities.api"
import { ideasApi } from "./ideas.api"
import type { Kind, CatalogRow } from "@/shared/lib/admin-catalog"
import type { PageResponse } from "@/types/api"

async function readPage(
  kind: Kind,
  page: number,
  signal: AbortSignal,
): Promise<PageResponse<CatalogRow>> {
  const params = { page, limit: 50 }
  if (kind === "projects") {
    const data = await projectsApi.list(params, signal)
    return {
      ...data,
      items: data.items.map((p) => ({
        kind,
        id: p.id,
        name: p.name,
        description: p.description,
        createdAt: p.createdAt,
        ownerId: p.authorId,
        username: p.author.username,
        status: p.status,
      })),
    }
  }
  if (kind === "ideas") {
    const data = await ideasApi.list(params, signal)
    return {
      ...data,
      items: data.items.map((i) => ({
        kind,
        id: i.id,
        name: i.name,
        description: i.description,
        createdAt: i.createdAt,
        ownerId: i.authorId,
        username: i.author.username,
        converted: i.projectId != null,
      })),
    }
  }
  const data = await communitiesApi.list(params, signal)
  return {
    ...data,
    items: data.items.map((c) => ({
      kind,
      id: c.id,
      name: c.name,
      description: c.description,
      createdAt: c.createdAt,
      ownerId: c.creatorId,
      username: c.creator.username,
      members: c.membersCount,
    })),
  }
}

export function useAdminCatalog(kind: Kind) {
  return useQuery({
    queryKey: ["admin-catalog", kind],
    queryFn: async ({ signal }) => {
      const first = await readPage(kind, 1, signal)
      const rows = new Map(first.items.map((row) => [row.id, row]))
      const pages = Math.ceil(first.total / first.limit)
      for (let page = 2; page <= pages; page += 3) {
        const batch = Array.from({ length: Math.min(3, pages - page + 1) }, (_, i) =>
          readPage(kind, page + i, signal),
        )
        for (const result of await Promise.all(batch))
          for (const row of result.items) rows.set(row.id, row)
      }
      return [...rows.values()].sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id - a.id,
      )
    },
  })
}
