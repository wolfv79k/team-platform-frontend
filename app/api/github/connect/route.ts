import type { NextRequest } from "next/server"
import { startGithubConnection } from "@/services/github-oauth.server"

export function GET(request: NextRequest) {
  return startGithubConnection(request)
}
