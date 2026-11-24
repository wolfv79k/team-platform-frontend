import { expect, test, type Page } from "@playwright/test"

async function login(page: Page, username: string, target: string) {
  await page.goto(target)
  await expect(page).toHaveURL(/\/login\?callbackUrl=/)
  await page.locator("#auth-email").fill(`${username}@example.test`)
  await page.locator('input[name="password"]').fill("test-password")
  await page.getByRole("button", { name: "Войти", exact: true }).click()
}

test("revoking the role blocks an already open admin form", async ({ page, request }) => {
  await login(page, "temporary_admin", "/admin/ideas")
  await page.getByRole("button", { name: "Добавить идею" }).click()
  const dialog = page.getByRole("dialog")
  const name = "Проверка отзыва роли"
  await dialog.getByLabel("Название").fill(name)
  const fixture = `http://127.0.0.1:${process.env.PLAYWRIGHT_BACKEND_PORT || "3108"}`
  expect((await request.post(`${fixture}/fixture/revoke-temporary-admin`)).status()).toBe(204)
  await dialog.getByRole("button", { name: "Сохранить" }).click()
  await expect(dialog.getByRole("alert")).toContainText("Доступ закрыт")
  const ideas = await (await request.get(`${fixture}/api/ideas`)).json()
  expect(ideas.items.map((row: { name: string }) => row.name)).not.toContain(name)
  await page.reload()
  await expect(page).toHaveURL(/\/user$/)
})

test("guest and ordinary user cannot open admin or nested catalog", async ({ page }) => {
  await login(page, "applicant", "/admin/projects")
  await expect(page).toHaveURL(/\/user$/)
  await page.goto("/admin")
  await expect(page).toHaveURL(/\/user$/)
  await expect(page.getByRole("link", { name: "Админ-панель" })).toHaveCount(0)
})

test("admin dashboard, catalogs, ownership, CRUD, mobile and sign-out", async ({ page }) => {
  await login(page, "moderator", "/admin")
  await expect(page.getByRole("heading", { name: "Динамика публикаций" })).toBeVisible()
  await page.getByLabel("Период аналитики").selectOption("7")
  await expect(page.getByLabel("День для просмотра").locator("option")).toHaveCount(7)
  if (process.env.ADMIN_SCREENSHOT)
    await page.screenshot({ path: process.env.ADMIN_SCREENSHOT, fullPage: true })
  for (const [kind, title, singular] of [
    ["projects", "Проекты", "проект"],
    ["ideas", "Идеи", "идею"],
    ["communities", "Сообщества", "сообщество"],
  ]) {
    await page
      .getByRole("navigation", { name: "Администрирование" })
      .getByRole("link", { name: title })
      .click()
    await expect(page.getByText("Просмотр", { exact: true }).first()).toBeVisible()
    await page.getByRole("button", { name: `Добавить ${singular}` }).click()
    const dialog = page.getByRole("dialog")
    const name = `Админ ${kind}`
    await dialog.getByLabel("Название").fill(name)
    if (kind === "projects") await dialog.getByLabel("Роль автора").selectOption("1")
    await dialog.getByRole("button", { name: "Сохранить" }).click()
    await expect(dialog).toHaveCount(0)
    await page.getByRole("button", { name: `Редактировать ${name}` }).click()
    await dialog.getByLabel("Название").fill(name + " 2")
    if (kind === "projects") await dialog.getByLabel("Статус").selectOption("IN_PROGRESS")
    await dialog.getByRole("button", { name: "Сохранить" }).click()
    await expect(dialog).toHaveCount(0)
    await page.getByRole("searchbox").fill(name + " 2")
    await page.getByRole("button", { name: `Удалить ${name} 2` }).click()
    await dialog.getByRole("button", { name: "Отмена" }).click()
    await page.getByRole("button", { name: `Удалить ${name} 2` }).click()
    await dialog.getByRole("button", { name: "Удалить", exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page.getByRole("link", { name: name + " 2", exact: true })).toHaveCount(0)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole("link", { name: "Обзор", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Статусы проектов" })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.getByRole("link", { name: "На платформу" }).click()
  await expect(page).toHaveURL(/\/user$/)
  await page.getByRole("link", { name: "Панель", exact: true }).click()
  await page.getByRole("button", { name: "Выйти из аккаунта" }).click()
  await expect(page).toHaveURL(/\/login$/)
  await page.goto("/admin/ideas")
  await expect(page).toHaveURL(/\/login\?callbackUrl=/)
})
