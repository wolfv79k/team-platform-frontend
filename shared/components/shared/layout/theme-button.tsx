"use client"

import { Moon, Sun } from "lucide-react"
import { useSiteTheme } from "./site-theme"

export default function ThemeButton({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const { dark, toggleTheme } = useSiteTheme()
  const Icon = dark ? Sun : Moon

  return (
    <button
      type="button"
      aria-label="Сменить тему"
      aria-pressed={dark}
      onClick={toggleTheme}
      className={className}
    >
      <span className="icon flex shrink-0">
        <Icon size={16} strokeWidth={1.65} aria-hidden="true" />
      </span>
      {!compact && <span>Сменить тему</span>}
    </button>
  )
}
