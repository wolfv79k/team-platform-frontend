import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { NewProjectForm } from "@/shared/components/shared/catalog/project-form"
import { loginUrl, parseProjectId } from "@/shared/lib/project-display"

export default async function Page({ searchParams }: { searchParams: Promise<{ ideaId?: string }> }) {
  const { ideaId } = await searchParams
  const id = ideaId ? parseProjectId(ideaId) : null
  if (!(await auth())?.accessToken) redirect(loginUrl(`/projects/new${id ? `?ideaId=${id}` : ""}`))
  return <NewProjectForm ideaId={id ?? undefined} />
}
