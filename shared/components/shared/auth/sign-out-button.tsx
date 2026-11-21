"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  async function logout() {
    if (pending) return
    setPending(true)
    setError("")
    try {
      await signOut({ redirectTo: "/" })
    } catch {
      setError("Не удалось выйти. Попробуйте ещё раз.")
      setPending(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={logout}
        disabled={pending}
        className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-left text-compact text-account-copy hover:bg-account-interaction disabled:cursor-wait disabled:opacity-60"
      >
        <LogOut size={18} strokeWidth={1.65} aria-hidden="true" />
        {pending ? "Выходим…" : "Выйти"}
      </button>
      {error && (
        <p role="alert" className="px-3 text-xs text-destructive">
          {error}
        </p>
      )}
    </>
  )
}
