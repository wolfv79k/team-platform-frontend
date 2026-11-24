import { requireAdmin } from "@/services/admin-access.server"
import { AdminFrame } from "@/shared/components/admin/frame"
import { Overview } from "@/shared/components/admin/overview"

export default async function AdminPage() {
  const admin = await requireAdmin("/admin")
  return (
    <AdminFrame name={admin.name}>
      <Overview />
    </AdminFrame>
  )
}
