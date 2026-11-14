"use client"

import { useEffect, useState } from "react"
import type { LocationEntity } from "@/types/models"
import { Button } from "@/shared/components/ui/button"
import { getAuthLocations } from "@/app/actions/auth"

export function LocationField({ onReady }: { onReady: (ready: boolean) => void }) {
  const [locations, setLocations] = useState<LocationEntity[]>()
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let ignore = false
    getAuthLocations()
      .then((result) => {
        if (ignore) return
        if (result.locations?.length) {
          setLocations(result.locations)
          onReady(true)
        } else {
          setError(result.error ?? "В списке пока нет городов.")
        }
      })
      .catch(() => {
        if (!ignore) setError("Не удалось загрузить список городов.")
      })
    return () => {
      ignore = true
    }
  }, [onReady, retry])

  return (
    <div className="field">
      <label htmlFor="auth-city" className="text-sm font-medium">
        Город <span className="required">*</span>
      </label>
      <select
        id="auth-city"
        name="locationId"
        required
        disabled={!locations}
        defaultValue=""
        className="h-11 w-full rounded-lg border border-foreground/25 bg-card px-3 text-base focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-70"
      >
        <option value="" disabled>
          {locations ? "Выбери город" : error ? "Список недоступен" : "Загружаем города…"}
        </option>
        {locations?.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
      </select>
      {error && (
        <div className="flex items-center justify-between gap-2">
          <p role="status" className="text-sm text-muted-foreground">
            {error}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setError("")
              setRetry((value) => value + 1)
            }}
          >
            Повторить
          </Button>
        </div>
      )}
    </div>
  )
}
