"use client"
import Link from "next/link"
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main className="adm-fallback">
      <h1>Панель временно недоступна</h1>
      <p>Проверьте соединение с сервером и попробуйте ещё раз.</p>
      <button className="adm-btn primary" onClick={reset}>
        Повторить
      </button>{" "}
      <Link className="adm-btn" href="/user">
        В профиль
      </Link>
    </main>
  )
}
