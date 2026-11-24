import { apiClient } from "./apiClient"
import { apiEndpoints } from "./apiEndpoints"
import type { ProjectStatus } from "@/types/enums"
import type {
  CreateProjectInput,
  CreatedProject,
  PageResponse,
  ProjectDetail,
  ProjectFilters,
  ProjectListItem,
  ProjectMemberView,
  ProjectRoleView,
  ProjectSkillView,
  SetRoleInput,
  SetSkillInput,
  UpdateProjectInput,
} from "@/types/api"

const p = apiEndpoints.projects
export const projectsApi = {
  list: async (params: ProjectFilters = {}, signal?: AbortSignal) =>
    (await apiClient.get<PageResponse<ProjectListItem>>(p.list, { params, signal })).data,
  get: async (id: number) => (await apiClient.get<ProjectDetail>(p.detail(id))).data,
  create: async (input: CreateProjectInput) =>
    (await apiClient.post<CreatedProject>(p.list, input)).data,
  update: async (id: number, input: UpdateProjectInput) =>
    (await apiClient.patch<ProjectDetail>(p.detail(id), input)).data,
  updateStatus: async (id: number, status: ProjectStatus) => {
    const { data } = await apiClient.patch<ProjectDetail>(p.detail(id), { status })
    if (data.status !== status) throw new Error("Сервер не подтвердил изменение статуса проекта.")
    return data
  },
  remove: async (id: number) => {
    await apiClient.delete(p.detail(id))
  },
  setSkill: async (id: number, skillId: number, input: SetSkillInput) =>
    (await apiClient.put<ProjectSkillView>(p.skill(id, skillId), input)).data,
  removeSkill: async (id: number, skillId: number) => {
    await apiClient.delete(p.skill(id, skillId))
  },
  setRole: async (id: number, roleId: number, input: SetRoleInput) =>
    (await apiClient.put<ProjectRoleView>(p.role(id, roleId), input)).data,
  removeRole: async (id: number, roleId: number) => {
    await apiClient.delete(p.role(id, roleId))
  },
  changeMemberRole: async (id: number, userId: number, roleId: number) =>
    (await apiClient.patch<ProjectMemberView>(p.member(id, userId), { roleId })).data,
  removeMember: async (id: number, userId: number) => {
    await apiClient.delete(p.member(id, userId))
  },
  leave: async (id: number) => {
    await apiClient.delete(p.member(id, "me"))
  },
  updateContribution: async (id: number, contribution: string) =>
    (await apiClient.patch<ProjectMemberView>(p.member(id, "me"), { contribution })).data,
}
