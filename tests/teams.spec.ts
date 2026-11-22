import { expect, test } from "@playwright/test"

test("team preview supports creation, applications, invitations and membership", async ({
  page,
}) => {
  await page.goto("/teams")
  await expect(page.getByText("Демо-режим команд.", { exact: false })).toBeVisible()
  await page.getByRole("link", { name: "Создать команду" }).click()
  await page.locator("#name").fill("Команда проверки")
  await page.locator("#description").fill("Совместная разработка")
  await page.locator("#team-skill-search").fill("ReactJS")
  await page.getByRole("option", { name: "ReactJS", exact: true }).click()
  await page.getByText("Уровни навыков", { exact: true }).click()
  await page.getByLabel("Требуемый уровень: ReactJS").selectOption("ADVANCED")
  await page.getByRole("button", { name: "Создать в демо" }).click()
  await expect(page.getByRole("heading", { name: "Команда проверки" })).toBeVisible()
  await expect(page.getByText("Продвинутый", { exact: true })).toBeVisible()

  await page.getByRole("link", { name: "Редактировать" }).click()
  await expect(page.locator("#name")).toHaveValue("Команда проверки")
  await page.locator("#description").fill("Обновлённое описание")
  await page.getByRole("button", { name: "Сохранить в демо" }).click()
  await expect(page.getByText("Обновлённое описание", { exact: true })).toBeVisible()

  await page.getByLabel("Демо-пользователь").selectOption("2")
  await page.getByRole("button", { name: "Подать заявку", exact: true }).click()
  await page.locator("#team-application-message").fill("Хочу заниматься дизайном")
  await page.getByRole("button", { name: "Отправить заявку в демо" }).click()
  await expect(
    page.locator(".project-application .tag").filter({ hasText: "На рассмотрении" }),
  ).toBeVisible()
  await expect(page.getByRole("button", { name: "Отправить заявку в демо" })).toHaveCount(0)
  await page.getByLabel("Демо-пользователь").selectOption("1")
  await page.getByRole("button", { name: "Заявки и приглашения (1)" }).click()
  await page.getByRole("button", { name: "Принять", exact: true }).click()
  await expect(
    page.locator(".project-application .tag").filter({ hasText: "Принято" }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Участники (2)" }).click()
  await expect(
    page.locator(".project-member-item").filter({ hasText: "Варвара Зорина" }),
  ).toBeVisible()

  await page.getByRole("button", { name: "Пригласить", exact: true }).click()
  await page.locator("#team-invite-username").selectOption("lev_s")
  await page.locator("#team-application-message").fill("Приглашаю в команду")
  await page.getByRole("button", { name: "Отправить приглашение в демо" }).click()
  await page.getByLabel("Демо-пользователь").selectOption("3")
  await page.getByRole("link", { name: "Команды", exact: true }).first().click()
  await page.getByRole("link", { name: "Заявки и приглашения" }).click()
  await page.getByRole("button", { name: "Принять", exact: true }).click()
  await page.getByRole("link", { name: "Команда проверки" }).click()
  await expect(page.getByRole("button", { name: "Участники (3)" })).toBeVisible()
  await page.getByRole("button", { name: "Изменить", exact: true }).click()
  await page.locator("#team-contribution").fill("Разработал сервер")
  await page.getByRole("button", { name: "Сохранить в демо" }).click()
  await expect(page.getByText("Разработал сервер", { exact: true })).toBeVisible()

  await page.getByLabel("Демо-пользователь").selectOption("4")
  await page.getByRole("button", { name: "Подать заявку", exact: true }).click()
  await page.getByRole("button", { name: "Отправить заявку в демо" }).click()
  page.once("dialog", (dialog) => dialog.accept())
  await page.getByRole("button", { name: "Отозвать", exact: true }).click()
  await expect(page.getByText("Заявок и приглашений пока нет.")).toBeVisible()
  await page.getByRole("button", { name: "Отправить заявку в демо" }).click()
  await page.getByLabel("Демо-пользователь").selectOption("1")
  await page.getByRole("button", { name: "Заявки и приглашения (1)" }).click()
  await page.getByRole("button", { name: "Отклонить", exact: true }).click()
  await expect(
    page.locator(".project-application .tag").filter({ hasText: "Отклонено" }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Участники (3)" }).click()
  await expect(page.locator(".project-member-item")).toHaveCount(3)
  page.once("dialog", (dialog) => dialog.accept())
  await page.locator(".project-member-item").filter({ hasText: "Варвара Зорина" }).getByRole("button", { name: "Исключить" }).click()
  await expect(page.getByRole("button", { name: "Участники (2)" })).toBeVisible()
  await page.getByLabel("Демо-пользователь").selectOption("3")
  await page.getByRole("button", { name: "Участники (2)" }).click()
  page.once("dialog", (dialog) => dialog.accept())
  await page.getByRole("button", { name: "Покинуть команду" }).click()
  await expect(page.getByRole("button", { name: "Участники (1)" })).toBeVisible()
  await page.getByLabel("Демо-пользователь").selectOption("1")
  page.once("dialog", (dialog) => dialog.accept())
  await page.getByRole("button", { name: "Удалить команду" }).click()
  await expect(page.getByRole("heading", { name: "Команды", exact: true })).toBeVisible()
  await expect(page.getByRole("link", { name: "Команда проверки" })).toHaveCount(0)
})

test("team catalog and form fit a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/teams")
  await expect(page.getByRole("heading", { name: "Команды", exact: true })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390)
  await page.getByRole("link", { name: "Создать команду" }).click()
  await expect(page.getByRole("heading", { name: "Создать команду" })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390)
})
