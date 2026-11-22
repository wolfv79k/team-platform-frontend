import { apiClient } from "./apiClient"
import { apiEndpoints } from "./apiEndpoints"
import type { CommunityView, CreatedCommunity, PageParams, PageResponse } from "@/types/api"

type CommunityInput = { name: string; description?: string }
const c = apiEndpoints.communities
export const communitiesApi = {
  list: async (params?: PageParams & { search?: string }, signal?: AbortSignal) =>
    (await apiClient.get<PageResponse<CommunityView>>(c.list, { params, signal })).data,
  get: async (id: number) => (await apiClient.get<CommunityView>(c.detail(id))).data,
  create: async (input: CommunityInput) => (await apiClient.post<CreatedCommunity>(c.list, input)).data,
  update: async (id: number, input: Partial<CommunityInput>) =>
    (await apiClient.patch<CommunityView>(c.detail(id), input)).data,
  remove: async (id: number) => {
    await apiClient.delete(c.detail(id))
  },
  join: async (id: number) => {
    await apiClient.put(c.membership(id))
  },
  leave: async (id: number) => {
    await apiClient.delete(c.membership(id))
  },
}
