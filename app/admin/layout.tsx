import type { Metadata } from "next"
import QueryProvider from "@/shared/components/shared/layout/query-provider"
import "./admin.css"

export const metadata: Metadata = {
  title: "Администрирование · TeamPlatform",
  robots: { index: false, follow: false },
}
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm">
      <QueryProvider>{children}</QueryProvider>
    </div>
  )
}
