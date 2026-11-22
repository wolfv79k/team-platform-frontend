import { getViewer } from "@/services/viewer"
import AccountLayout from "@/shared/components/shared/layout/account-layout"
import { ViewerProvider } from "@/shared/components/shared/layout/viewer-provider"
import QueryProvider from "@/shared/components/shared/layout/query-provider"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer()
  return (
    <ViewerProvider viewer={viewer}>
      <QueryProvider key={viewer?.id ?? "guest"}><AccountLayout>{children}</AccountLayout></QueryProvider>
    </ViewerProvider>
  )
}
