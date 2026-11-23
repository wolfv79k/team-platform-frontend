import { handlers } from "@/auth"
import type { NextRequest } from "next/server"
import { finishGithubConnection, isGithubPortfolioCallback } from "@/services/github-oauth.server"

export const POST = handlers.POST

export function GET(request: NextRequest) {
  if (isGithubPortfolioCallback(request)) return finishGithubConnection(request)
  return handlers.GET(request)
}
