# Team Platform

Фронтенд платформы для поиска IT-проектов, команд и развития через практику.

## Стек

### Основной стек и инструменты для верстки

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide Icons

### Работа с формами

* Shadcn/ui Fields
* React Hook Form
* Zod

### Работа с данными

* TanStack Query
* Axios

### Управление состоянием

* Zustang
* Local State

### Маршрутизация

* Next.js App Router

### Работа с API

* REST API
* HTTP-запросы через Axios
* Типизация запросов и ответов с TypeScript

### Статус проекта

Проект находится в стадии разработки.

Основной приоритет на текущем этапе — создание MVP платформы и реализация базовых пользовательских сценариев:

- регистрация и авторизация;

## Вход и регистрация

Фронтенду нужны `NEXT_PUBLIC_API_URL` (адрес бэкенда без `/api`), `AUTH_SECRET`,
`AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` и серверный `AUTH_INTERNAL_SECRET`.
Задайте `AUTH_URL` равным адресу фронтенда (локально, например, `http://localhost:3000`) и открывайте сайт по этому адресу. В GitHub OAuth App укажите callback `<адрес фронтенда>/api/auth/callback/github`.

Вход по коду выключен по умолчанию. После подключения отправки писем включите
`AUTH_EMAIL_CODE_ENABLED=true`. Фронтенд ожидает следующие ответы API:

- `POST /api/auth/email-code` принимает `{ mode: "login", email }` и после отправки
  возвращает `{ challengeId, resendAfterSeconds }`.
- `POST /api/auth/email-code/verify` принимает `{ challengeId, code }` и возвращает
  `{ token, user }` как при входе по паролю. Для неверного или просроченного кода
  ожидается 400 или 401. Сервер отвечает за срок действия, одноразовость и лимиты.
