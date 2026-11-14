import { Plus_Jakarta_Sans, Inter } from "next/font/google"
import { cookies } from "next/headers"
import "./globals.css"
import { cn } from "@/shared/lib/utils"
import { SiteTheme } from "@/shared/components/shared/layout/site-theme"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["cyrillic-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get("teamplatform-theme")?.value === "dark" ? "dark" : "light"

  return (
    <html lang="ru" className={cn("font-sans", inter.variable, theme === "dark" && "dark")}>
      <body className={plusJakarta.className}>
        <SiteTheme initialTheme={theme}>{children}</SiteTheme>
      </body>
    </html>
  )
}
