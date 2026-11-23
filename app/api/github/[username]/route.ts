import { githubCacheSeconds, githubUsername } from "@/shared/lib/github-profile"
import { GitHubPublicError, loadGitHubPublicProfile } from "@/services/github-public.server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const raw = (await params).username
  const username = githubUsername(raw)
  if (!username || username !== raw.toLowerCase()) {
    return Response.json({ error: "Укажи корректное имя пользователя GitHub." }, { status: 400 })
  }
  try {
    const profile = await loadGitHubPublicProfile(username)
    return Response.json(profile, {
      headers: {
        "Cache-Control":
          profile.repositories && profile.events && profile.contributions
            ? `public, s-maxage=${githubCacheSeconds}, stale-while-revalidate=300`
            : "no-store",
      },
    })
  } catch (error) {
    return Response.json(
      {
        error: error instanceof GitHubPublicError ? error.message : "Не удалось загрузить GitHub.",
      },
      {
        status: error instanceof GitHubPublicError ? error.status : 502,
        headers: { "Cache-Control": "no-store" },
      },
    )
  }
}
