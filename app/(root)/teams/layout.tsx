import { TeamPreviewProvider } from "@/shared/components/shared/catalog/team-preview-provider"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TeamPreviewProvider>{children}</TeamPreviewProvider>
}
