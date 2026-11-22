import { apiClient } from "./apiClient"
import { apiEndpoints } from "./apiEndpoints"
import type { IdeaView, PageParams, PageResponse, ProjectDetail } from "@/types/api"

type IdeaInput = { name: string; description?: string }
const i = apiEndpoints.ideas
export const ideasApi = {
  list: async (params?: PageParams, signal?: AbortSignal) =>
    (await apiClient.get<PageResponse<IdeaView>>(i.list, { params, signal })).data,
  get: async (id: number) => (await apiClient.get<IdeaView>(i.detail(id))).data,
  create: async (input: IdeaInput) => (await apiClient.post<IdeaView>(i.list, input)).data,
  update: async (id: number, input: Partial<IdeaInput>) =>
    (await apiClient.patch<IdeaView>(i.detail(id), input)).data,
  remove: async (id: number) => {
    await apiClient.delete(i.detail(id))
  },
  convert: async (id: number, roleId: number) =>
    (await apiClient.post<ProjectDetail>(i.convert(id), { roleId })).data,
}
