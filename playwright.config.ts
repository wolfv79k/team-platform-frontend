import { defineConfig } from "@playwright/test"
import { resolve } from "node:path"

const frontendPort = process.env.PLAYWRIGHT_FRONTEND_PORT || "3107"
const backendPort = process.env.PLAYWRIGHT_BACKEND_PORT || "3108"
const frontend = `http://127.0.0.1:${frontendPort}`
const backend = `http://127.0.0.1:${backendPort}`

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  workers: 1,
  timeout: 120_000,
  use: {
    baseURL: frontend,
    channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || "chrome",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "node tests/mock-project-api.mjs",
      url: `${backend}/api/health`,
      reuseExistingServer: false,
      env: { MOCK_API_PORT: backendPort },
    },
    {
      command: `npm run dev -- --hostname 127.0.0.1 --port ${frontendPort}`,
      url: frontend,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        NODE_OPTIONS:
          `${process.env.NODE_OPTIONS ?? ""} --require="${resolve("tests/mock-github-fetch.cjs").replaceAll("\\", "/")}"`.trim(),
        NEXT_PUBLIC_API_URL: backend,
        PLAYWRIGHT_TEST_DIST_DIR: ".next/playwright",
        AUTH_URL: frontend,
        AUTH_TRUST_HOST: "true",
        AUTH_SECRET: "local-playwright-test-secret-not-for-production",
        AUTH_GITHUB_ID: "local-mock",
        AUTH_GITHUB_SECRET: "local-mock",
      },
    },
  ],
})
