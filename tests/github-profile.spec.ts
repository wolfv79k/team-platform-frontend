import { expect, test, type Page } from "@playwright/test"
import type { GitHubPublicProfile } from "../types/github"

async function mockGithub(page: Page) {
  const now = new Date()
  const days = Array.from({ length: 365 }, (_, index) => ({
    date: new Date(now.getTime() - (364 - index) * 86_400_000).toISOString().slice(0, 10),
    count: index === 364 ? 5 : 0,
    level: index === 364 ? 3 : 0,
  }))
  const profile: GitHubPublicProfile = {
    id: 101,
    login: "octocat",
    name: "GitHub Test Account",
    avatarUrl: null,
    profileUrl: "https://github.com/octocat",
    publicRepos: 3,
    followers: 2,
    following: 1,
    repositories: [
      {
        id: 201,
        name: "test-repository",
        fullName: "octocat/test-repository",
        url: "https://github.com/octocat/test-repository",
        description: "Public project",
        language: "TypeScript",
        stars: 5,
        forks: 2,
        fork: false,
        archived: false,
        pushedAt: now.toISOString(),
      },
    ],
    events: [
      {
        id: "event-1",
        type: "PushEvent",
        repository: "octocat/test-repository",
        url: "https://github.com/octocat/test-repository",
        createdAt: now.toISOString(),
      },
    ],
    contributions: { total: 5, days },
    warnings: {},
    fetchedAt: now.toISOString(),
  }
  await page.route("**/api/github/octocat", (route) => route.fulfill({ json: profile }))
}

test("GitHub portfolio requires OAuth ownership, displays the yearly calendar and disconnects", async ({
  page,
  browser,
  baseURL,
  request,
}) => {
  await mockGithub(page)
  let deny = true
  await page.route(/\/api\/github\/connect\?/, async (route) => {
    const response = await route.fetch({ maxRedirects: 0 })
    const authorize = new URL(response.headers().location)
    expect(authorize.origin + authorize.pathname).toBe("https://github.com/login/oauth/authorize")
    expect(authorize.searchParams.get("client_id")).toBe("local-mock")
    expect(authorize.searchParams.get("code_challenge_method")).toBe("S256")
    expect(authorize.searchParams.get("code_challenge")).toBeTruthy()
    const callback = new URL(authorize.searchParams.get("redirect_uri")!)
    expect(callback.pathname).toBe("/api/auth/callback/github")
    callback.searchParams.set("state", authorize.searchParams.get("state")!)
    callback.searchParams.set(deny ? "error" : "code", deny ? "access_denied" : "fixture-code")
    await route.fulfill({ response, headers: { ...response.headers(), location: callback.href } })
  })
  await page.goto("/login?callbackUrl=%2Fuser%2Fsettings%2Fprofile-edit")
  await page.locator("#auth-email").fill("owner@example.test")
  await page.locator('input[name="password"]').fill("test-password")
  await page.getByRole("button", { name: "Войти", exact: true }).click()
  await expect(page).toHaveURL(/\/user\/settings\/profile-edit$/)
  await page.goto("/api/auth/callback/github?state=tp-portfolio-invalid&code=fixture-code")
  await expect(page).toHaveURL(/\/user\?github=expired$/)
  await expect(page.getByRole("region", { name: "GitHub портфолио" })).toHaveCount(0)
  await page.goto("/user/settings/profile-edit")
  await expect(page.locator("#social-github")).toHaveAttribute("readonly", "")
  await page.getByRole("button", { name: "Подключить GitHub" }).click()
  await expect(page).toHaveURL(/profile-edit\?github=denied$/)
  await expect(page.locator("#social-github")).toHaveValue("")
  deny = false
  await page.getByRole("button", { name: "Подключить GitHub" }).click()
  await expect(page).toHaveURL(/profile-edit\?github=connected$/)
  await expect(page.locator("#social-github")).toHaveValue("https://github.com/octocat")
  await page.goto("/user")
  const portfolio = page.getByRole("region", { name: "GitHub портфолио" })
  await expect(portfolio.getByRole("heading", { name: "Активность GitHub" })).toBeVisible()
  await expect(portfolio.getByRole("img", { name: /Вклады за последний год: 5/ })).toBeVisible()
  await expect(portfolio.locator(".github-heatmap > span")).toHaveCount(365)
  await expect(portfolio.getByRole("heading", { name: "Последние репозитории" })).toBeVisible()
  await page.reload()
  await expect(portfolio.getByText("@octocat")).toBeVisible()
  const backend = `http://127.0.0.1:${process.env.PLAYWRIGHT_BACKEND_PORT || "3108"}`
  const owner = await (await request.get(`${backend}/api/users/owner`)).json()
  const signedUrl = owner.socialLinks.find(
    (item: { platform: string }) => item.platform === "GITHUB",
  ).url
  expect(signedUrl).toMatch(/^https:\/\/github\.com\/octocat#tp-github-v1\./)

  const visitor = await browser.newContext({ baseURL })
  try {
    const publicPage = await visitor.newPage()
    await mockGithub(publicPage)
    await publicPage.goto("/owner")
    await expect(publicPage.getByRole("region", { name: "GitHub портфолио" })).toBeVisible()
    // A pre-existing plain link or a proof from a different profile never authorizes the portfolio.
    for (const url of ["https://github.com/octocat", signedUrl]) {
      await request.put(`${backend}/api/users/me/socials/GITHUB`, {
        headers: { Authorization: "Bearer mock-2" },
        data: { url },
      })
      await publicPage.goto("/applicant")
      await expect(publicPage.getByRole("region", { name: "GitHub портфолио" })).toHaveCount(0)
    }
    await request.delete(`${backend}/api/users/me/socials/GITHUB`, {
      headers: { Authorization: "Bearer mock-2" },
    })
    await page.goto("/user/settings/profile-edit")
    await page.getByRole("button", { name: "Управление GitHub" }).click()
    await page.getByRole("dialog").getByRole("button", { name: "Отключить" }).click()
    await expect(page.locator("#social-github")).toHaveValue("")
    await page.goto("/user")
    await expect(portfolio).toHaveCount(0)
    await publicPage.goto("/owner")
    await expect(publicPage.getByRole("region", { name: "GitHub портфолио" })).toHaveCount(0)
  } finally {
    await visitor.close()
  }
})
