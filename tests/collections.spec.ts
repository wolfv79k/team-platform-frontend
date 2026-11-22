import { expect, test, type Page } from "@playwright/test"

async function signIn(page: Page, username: string, callback: string) {
  await page.goto(`/login?callbackUrl=${encodeURIComponent(callback)}`)
  await page.locator("#auth-email").fill(`${username}@example.test`)
  await page.locator('input[name="password"]').fill("test-password")
  await page.getByRole("button", { name: "Войти", exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`${callback.replaceAll("/", "\\/")}$`), {
    timeout: 30_000,
  })
}

test("ideas use real API workflows including creation from an idea", async ({ page }) => {
  await page.goto("/ideas")
  await expect(page.getByRole("heading", { name: "Идея проверки" })).toBeVisible()
  await signIn(page, "owner", "/ideas/new")
  await page.locator("#name").fill("Идея для интеграции")
  await page.locator("#description").fill("Описание нового решения")
  await page.getByRole("button", { name: "Опубликовать идею" }).click()
  await expect(page.getByRole("heading", { name: "Идея для интеграции" })).toBeVisible()
  const ideaPath = new URL(page.url()).pathname
  await page.getByRole("link", { name: "Редактировать" }).click()
  await page.locator("#name").fill("Обновлённая идея интеграции")
  await page.getByRole("button", { name: "Сохранить", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Обновлённая идея интеграции" })).toBeVisible()
  await page.goto("/ideas")
  await page.getByRole("button", { name: "Мои идеи" }).click()
  await page.getByRole("searchbox").fill("Обновлённая")
  await expect(page.getByRole("heading", { name: "Обновлённая идея интеграции" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Идея проверки" })).toHaveCount(0)
  await page.getByRole("link", { name: "Обновлённая идея интеграции" }).click()
  await page.getByRole("link", { name: "Создать проект из идеи" }).click()
  await expect(page.locator("#name")).toHaveValue("Обновлённая идея интеграции")
  await page.locator("#roleId").selectOption("1")
  await page.getByRole("button", { name: "Создать проект", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Обновлённая идея интеграции" })).toBeVisible()
  const projectPath = new URL(page.url()).pathname
  await page.goto(ideaPath)
  await expect(page.getByRole("link", { name: "Обновлённая идея интеграции" })).toHaveAttribute(
    "href",
    projectPath,
  )
  await expect(page.getByRole("link", { name: "Создать проект из идеи" })).toHaveCount(0)
  page.once("dialog", (dialog) => dialog.accept())
  await page.getByRole("button", { name: "Удалить", exact: true }).click()
  await expect(page).toHaveURL(/\/ideas$/)
  await expect(page.getByRole("heading", { name: "Обновлённая идея интеграции" })).toHaveCount(0)
  await page.goto(projectPath)
  page.once("dialog", (dialog) => dialog.accept())
  await page.getByRole("button", { name: "Удалить", exact: true }).first().click()
  await expect(page).toHaveURL(/\/projects$/)
})

test("communities use real CRUD and membership operations", async ({ browser, baseURL }) => {
  const ownerContext = await browser.newContext({ baseURL })
  const memberContext = await browser.newContext({ baseURL })
  const owner = await ownerContext.newPage()
  const member = await memberContext.newPage()
  try {
    await signIn(owner, "owner", "/communities/new")
    await owner.locator("#name").fill("Сообщество интеграции")
    await owner.locator("#description").fill("Обсуждаем разработку")
    await owner.getByRole("button", { name: "Создать сообщество" }).click()
    await expect(owner.getByRole("heading", { name: "Сообщество интеграции" })).toBeVisible()
    const path = new URL(owner.url()).pathname
    await expect(owner.getByText("Ты создатель", { exact: true })).toBeVisible()
    await owner.getByRole("link", { name: "Редактировать" }).click()
    await owner.locator("#name").fill("Обновлённое сообщество интеграции")
    await owner.getByRole("button", { name: "Сохранить", exact: true }).click()
    await expect(
      owner.getByRole("heading", { name: "Обновлённое сообщество интеграции" }),
    ).toBeVisible()
    await member.goto(path)
    await expect(member.getByRole("link", { name: "Войти, чтобы вступить" })).toBeVisible()
    await signIn(member, "applicant", path)
    await expect(member.getByRole("link", { name: "Редактировать" })).toHaveCount(0)
    await expect(member.getByText("1 участник", { exact: true })).toBeVisible()
    await member.getByRole("button", { name: "Вступить", exact: true }).click()
    await expect(member.getByText("Ты участник", { exact: true })).toBeVisible()
    await expect(member.getByText("2 участника", { exact: true })).toBeVisible()
    await member.reload()
    await member.getByRole("button", { name: "Вступить", exact: true }).click()
    await expect(member.getByText("2 участника", { exact: true })).toBeVisible()
    await member.getByRole("button", { name: "Выйти", exact: true }).click()
    await expect(member.getByText("1 участник", { exact: true })).toBeVisible()
    await expect(member.getByRole("button", { name: "Вступить", exact: true })).toBeVisible()
    await owner.goto("/communities")
    await owner.getByRole("button", { name: "Созданные мной" }).click()
    await owner.getByRole("searchbox").fill("Обновлённое")
    await expect(
      owner.getByRole("heading", { name: "Обновлённое сообщество интеграции" }),
    ).toBeVisible()
    await expect(owner.getByRole("heading", { name: "Сообщество проверки" })).toHaveCount(0)
    await owner.getByRole("link", { name: "Обновлённое сообщество интеграции" }).click()
    owner.once("dialog", (dialog) => dialog.accept())
    await owner.getByRole("button", { name: "Удалить", exact: true }).click()
    await expect(owner).toHaveURL(/\/communities$/)
    await expect(
      owner.getByRole("heading", { name: "Обновлённое сообщество интеграции" }),
    ).toHaveCount(0)
  } finally {
    await ownerContext.close()
    await memberContext.close()
  }
})

test("profile skill levels persist through the existing skill API", async ({ page }) => {
  await signIn(page, "owner", "/user/settings/profile-edit")
  await page.locator("#profile-technologies").fill("React")
  await page.getByRole("option", { name: "React", exact: true }).click()
  await page.getByText("Уровни навыков", { exact: true }).click()
  await page.getByLabel("Уровень владения: React").selectOption("ADVANCED")
  await page.getByRole("button", { name: "Сохранить изменения" }).click()
  await expect(page.getByText("Изменения сохранены.")).toBeVisible()
  await page.reload()
  await page.getByText("Уровни навыков", { exact: true }).click()
  await expect(page.getByLabel("Уровень владения: React")).toHaveValue("ADVANCED")
  await page.getByLabel("Уровень владения: React").selectOption("MIDDLE")
  await page.getByRole("button", { name: "Сохранить изменения" }).click()
  await expect(page.getByText("Изменения сохранены.")).toBeVisible()
  await page.goto("/user?tab=resume")
  await expect(page.getByText("· Средний", { exact: true })).toBeVisible()
  await page.goto("/user/settings/profile-edit")
  await page.getByRole("button", { name: "Убрать React" }).click()
  await page.getByRole("button", { name: "Сохранить изменения" }).click()
  await expect(page.getByText("Изменения сохранены.")).toBeVisible()
})
