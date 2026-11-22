import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { projectsApi } from "@/services/projects.api"
import { applicationsApi, type ApplicationFilters } from "@/services/applications.api"
import { dictionariesApi } from "@/services/dictionaries.api"
import type { ProjectFilters } from "@/types/api"

export const projectKeys = {
  all: ["projects"] as const,
  list: (filters: ProjectFilters) => ["projects", "list", filters] as const,
  detail: (id: number) => ["projects", "detail", id] as const,
}
export const applicationKeys = {
  all: ["applications"] as const,
  mine: (filters?: ApplicationFilters) => ["applications", "mine", filters ?? {}] as const,
  project: (id: number, filters?: ApplicationFilters) =>
    ["applications", "project", id, filters ?? {}] as const,
}
export const useProjects = (filters: ProjectFilters) =>
  useQuery({ queryKey: projectKeys.list(filters), queryFn: () => projectsApi.list(filters) })
export const useProject = (id: number) =>
  useQuery({ queryKey: projectKeys.detail(id), queryFn: () => projectsApi.get(id) })
export const useSkills = (enabled = true) =>
  useQuery({
    queryKey: ["dictionaries", "skills"],
    queryFn: dictionariesApi.skills,
    staleTime: 600_000,
    enabled,
  })
export const useRoles = (enabled = true) =>
  useQuery({
    queryKey: ["dictionaries", "roles"],
    queryFn: dictionariesApi.roles,
    staleTime: 600_000,
    enabled,
  })
export const useMyApplications = (enabled: boolean, filters?: ApplicationFilters) =>
  useQuery({
    queryKey: applicationKeys.mine(filters),
    queryFn: () => applicationsApi.mine(filters),
    enabled,
  })
export const useProjectApplications = (
  id: number,
  enabled: boolean,
  filters?: ApplicationFilters,
) =>
  useQuery({
    queryKey: applicationKeys.project(id, filters),
    queryFn: () => applicationsApi.forProject(id, filters),
    enabled,
  })

/** Membership, role slots and applications must stay in sync after any write. */
export function useProjectMutation<TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: projectKeys.all }),
        client.invalidateQueries({ queryKey: applicationKeys.all }),
        client.invalidateQueries({ queryKey: ["ideas"] }),
      ])
    },
  })
}
