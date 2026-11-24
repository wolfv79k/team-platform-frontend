import { notFound } from "next/navigation"
import { requireAdmin } from "@/services/admin-access.server"
import { isKind } from "@/shared/lib/admin-catalog"
import { AdminFrame } from "@/shared/components/admin/frame"
import { CatalogTable } from "@/shared/components/admin/catalog-table"

export default async function CatalogPage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params
  if (!isKind(kind)) notFound()
  const admin = await requireAdmin(`/admin/${kind}`)
  return (
    <AdminFrame name={admin.name} active={kind}>
      <CatalogTable key={kind} kind={kind} viewerId={admin.id} />
    </AdminFrame>
  )
}
