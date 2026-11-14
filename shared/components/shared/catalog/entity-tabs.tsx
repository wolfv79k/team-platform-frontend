"use client"

import { useState } from "react"

export default function EntityTabs({
  label,
  tabs,
}: {
  label: string
  tabs: { title: string; content: React.ReactNode }[]
}) {
  const [active, setActive] = useState(0)
  return (
    <>
      <nav className="detail-tabs" aria-label={label}>
        {tabs.map(({ title }, index) => (
          <button
            key={title}
            type="button"
            className={active === index ? "active" : ""}
            aria-pressed={active === index}
            onClick={() => setActive(index)}
          >
            {title}
          </button>
        ))}
      </nav>
      {tabs[active]?.content}
    </>
  )
}
