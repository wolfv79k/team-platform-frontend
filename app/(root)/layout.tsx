import { getViewer } from "@/services/viewer"
import AccountLayout from "@/shared/components/shared/layout/account-layout"
import { ViewerProvider } from "@/shared/components/shared/layout/viewer-provider"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer()
  return (
    <ViewerProvider viewer={viewer}>
      <AccountLayout>{children}</AccountLayout>
    </ViewerProvider>
  )
}
