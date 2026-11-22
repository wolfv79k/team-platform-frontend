import { apiClient } from "./apiClient"
import { apiEndpoints } from "./apiEndpoints"
import type { ProjectApplicationView } from "@/types/api"
import type { ApplicationStatus, ApplicationType } from "@/types/enums"

export type ApplicationFilters = { status?: ApplicationStatus; type?: ApplicationType }
export type ApplicationInput = { roleId: number; message?: string }
export type InvitationInput = ApplicationInput & { userId: number }
const a = apiEndpoints.applications
const p = apiEndpoints.projects
export const applicationsApi = {
  mine: async (params?: ApplicationFilters) =>
    (await apiClient.get<ProjectApplicationView[]>(a.mine, { params })).data,
  forProject: async (id: number, params?: ApplicationFilters) =>
    (await apiClient.get<ProjectApplicationView[]>(p.applications(id), { params })).data,
  apply: async (id: number, input: ApplicationInput) =>
    (await apiClient.post<ProjectApplicationView>(p.applications(id), input)).data,
  invite: async (id: number, input: InvitationInput) =>
    (await apiClient.post<ProjectApplicationView>(p.invitations(id), input)).data,
  accept: async (id: number) => (await apiClient.post<ProjectApplicationView>(a.accept(id))).data,
  decline: async (id: number) => (await apiClient.post<ProjectApplicationView>(a.decline(id))).data,
  withdraw: async (id: number) => {
    await apiClient.delete(a.withdraw(id))
  },
}
