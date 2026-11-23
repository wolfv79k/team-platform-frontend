import axios from "axios"
import type { GitHubPublicProfile } from "@/types/github"

export const githubApi = {
  async get(username: string, signal?: AbortSignal) {
    // The local read-only proxy has its own cache and needs no TeamPlatform access token.
    return (
      await axios.get<GitHubPublicProfile>(`/api/github/${encodeURIComponent(username)}`, {
        signal,
        timeout: 35_000,
      })
    ).data
  },
}
