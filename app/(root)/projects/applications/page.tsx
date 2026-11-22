import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { loginUrl } from "@/shared/lib/project-display"
import MyApplications from "@/shared/components/shared/catalog/project-applications"

export default async function Page() {
  if (!(await auth())?.accessToken) redirect(loginUrl("/projects/applications"))
  return <MyApplications />
}
