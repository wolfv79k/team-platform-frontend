import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { EditProjectForm } from "@/shared/components/shared/catalog/project-form"
import { loginUrl, parseProjectId } from "@/shared/lib/project-display"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = parseProjectId((await params).id)
  if (!id) notFound()
  if (!(await auth())?.accessToken) redirect(loginUrl(`/projects/${id}/edit`))
  return <EditProjectForm id={id} />
}
