// Only loaded in the Playwright frontend server. No real OAuth tokens are used.
const actualFetch = globalThis.fetch

globalThis.fetch = async (input, options) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
  if (url === "https://github.com/login/oauth/access_token") {
    const body = new URLSearchParams(options?.body)
    return Response.json(
      body.get("code") === "fixture-code" && body.get("code_verifier")
        ? { access_token: "fixture-token" }
        : { error: "bad_verification_code" },
    )
  }
  if (
    url === "https://api.github.com/user" &&
    new Headers(options?.headers).get("authorization") === "Bearer fixture-token"
  ) {
    return Response.json({ id: 101, login: "octocat" })
  }
  return actualFetch(input, options)
}
