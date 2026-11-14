"use client"

import { createContext, useContext, useState } from "react"

type Theme = "light" | "dark"
const ThemeContext = createContext({ dark: false, toggleTheme: () => {} })

export function SiteTheme({
  initialTheme,
  children,
}: {
  initialTheme: Theme
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState(initialTheme)

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark"
    document.cookie = `teamplatform-theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax`
    document.documentElement.classList.toggle("dark", next === "dark")
    setTheme(next)
  }

  return (
    <ThemeContext.Provider value={{ dark: theme === "dark", toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useSiteTheme = () => useContext(ThemeContext)
