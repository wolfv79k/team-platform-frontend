import { apiClient } from "./apiClient"
import { apiEndpoints } from "./apiEndpoints"
import type { LocationEntity, Role, Skill } from "@/types/models"
import type { PublicUser } from "@/types/api"

export const dictionariesApi = {
  skills: async () => (await apiClient.get<Skill[]>(apiEndpoints.skills)).data,
  roles: async () => (await apiClient.get<Role[]>(apiEndpoints.roles)).data,
  locations: async () => (await apiClient.get<LocationEntity[]>(apiEndpoints.locations)).data,
  user: async (username: string) =>
    (await apiClient.get<PublicUser>(apiEndpoints.users.detail(username))).data,
}
