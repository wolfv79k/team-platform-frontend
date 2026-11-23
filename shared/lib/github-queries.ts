import { useQuery } from "@tanstack/react-query"
import { githubApi } from "@/services/github.api"
import { githubCacheSeconds } from "./github-profile"

export function useGithubProfile(username: string | null, enabled = true) {
  return useQuery({
    queryKey: ["github-public-profile", username],
    queryFn: ({ signal }) => githubApi.get(username!, signal),
    enabled: enabled && !!username,
    staleTime: githubCacheSeconds * 1000,
    retry: false,
  })
}
