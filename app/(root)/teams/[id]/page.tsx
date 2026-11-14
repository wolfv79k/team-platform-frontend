import EntityDetail from "@/shared/components/shared/catalog/entity-detail"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EntityDetail kind="teams" id={Number(id)} />
}
