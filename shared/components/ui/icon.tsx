import type { LucideIcon } from "lucide-react"

export function Icon({ icon: Symbol, className = "" }: { icon: LucideIcon; className?: string }) {
  return (
    <span className={`icon ${className}`} aria-hidden="true">
      <Symbol strokeWidth={1.65} />
    </span>
  )
}
