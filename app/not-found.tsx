import Link from "next/link"

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 py-12">
      <div className="max-w-sm text-center">
        <p className="text-sm font-semibold text-muted-foreground">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Страница не найдена</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Проверьте адрес или вернитесь на главную.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex text-sm font-medium underline underline-offset-4"
        >
          На главную
        </Link>
      </div>
    </main>
  )
}
