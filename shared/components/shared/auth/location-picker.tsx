"use client"

import { useState, type FormEvent } from "react"
import { MapPin } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { LocationField } from "./location-field"
import { saveAuthLocation } from "@/app/actions/auth"

export function LocationPicker({ callbackUrl }: { callbackUrl?: string }) {
  const [ready, setReady] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || !ready) return
    const locationId = Number(new FormData(event.currentTarget).get("locationId"))
    setPending(true)
    setError("")
    try {
      const result = await saveAuthLocation(locationId, callbackUrl)
      if (result.redirectTo) {
        window.location.assign(result.redirectTo)
        return
      }
      setError(result.error ?? "Попробуйте ещё раз.")
    } catch {
      setError("Не удалось сохранить город. Попробуйте ещё раз.")
    }
    setPending(false)
  }

  return (
    <section className="grid min-h-dvh place-items-center px-4 pt-24 pb-10">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 text-card-foreground sm:p-8">
        <MapPin aria-hidden="true" className="mb-4 size-6 text-foreground" strokeWidth={1.75} />
        <h1 className="text-2xl font-semibold tracking-tight">Укажите город</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Город будет указан в вашем профиле TeamPlatform.
        </p>
        <form method="post" onSubmit={submit} className="mt-6 grid gap-4">
          <LocationField onReady={setReady} />
          {error && (
            <p role="alert" className="text-sm font-medium">
              {error}
            </p>
          )}
          <Button type="submit" disabled={!ready || pending} className="h-11 w-full">
            {pending ? "Сохраняем…" : "Сохранить город"}
          </Button>
        </form>
      </div>
    </section>
  )
}
