"use client"

import { useRef, useState } from "react"
import { projectsApi } from "@/services/projects.api"
import { ideasApi } from "@/services/ideas.api"
import type { ProjectFields } from "@/types/api"
import { ProjectStatus, SkillLevel } from "@/types/enums"
import { useProjectMutation } from "./project-queries"
import { httpUrl } from "./project-display"

export type SelectedSkill = { id: number; name: string; level: SkillLevel }
export type SelectedVacancy = { id: number; name: string; slots: number }

type ProjectSubmission = {
  fields: ProjectFields
  roleId: number
  status: ProjectStatus
  skills: SelectedSkill[]
  vacancies: SelectedVacancy[]
  contribution?: string
}

export function formValue(data: FormData, key: string) {
  return String(data.get(key) ?? "").trim()
}

export function readProjectStatus(data: FormData, fallback: ProjectStatus) {
  const status = formValue(data, "status")
  return Object.values(ProjectStatus).includes(status as ProjectStatus)
    ? (status as ProjectStatus)
    : fallback
}

export function readProjectFields(data: FormData): ProjectFields {
  return {
    name: formValue(data, "name"),
    slogan: formValue(data, "slogan"),
    description: formValue(data, "description"),
    projectUrl: formValue(data, "projectUrl"),
    videoUrl: formValue(data, "videoUrl"),
    partners: [
      ...new Set(
        formValue(data, "partners")
          .split(/[,\n]/)
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ],
  }
}

export function validateProjectFields(fields: ProjectFields) {
  if (!fields.name || fields.name.length > 100) return "Укажите название проекта (до 100 символов)."
  if ((fields.slogan?.length ?? 0) > 160) return "Краткое описание — до 160 символов."
  if (
    [fields.projectUrl, fields.videoUrl].some((url) => url && (url.length > 500 || !httpUrl(url)))
  ) {
    return "Укажите корректные ссылки, начинающиеся с https:// или http://."
  }
  return ""
}

export function selectedProjectSkills(project: {
  projectSkills: { skill: { id: number; name: string }; skillLevel: SkillLevel }[]
}): SelectedSkill[] {
  return project.projectSkills.map(({ skill, skillLevel }) => ({
    id: skill.id,
    name: skill.name,
    level: skillLevel,
  }))
}

/** A filled vacancy with zero remaining slots may already exist on the server. */
export function validateVacancies(vacancies: SelectedVacancy[], existing: SelectedVacancy[] = []) {
  return vacancies.some(({ id, slots }) =>
    !Number.isInteger(slots) || slots > 20 || (slots < 1 && !(slots === 0 && existing.some((role) => role.id === id && role.slots === 0)))
  ) ? "Количество мест должно быть от 1 до 20." : ""
}

export async function syncProjectVacancies(projectId: number, selected: SelectedVacancy[], original?: SelectedVacancy[]) {
  const current = (await projectsApi.get(projectId)).projectOpenRoles
  for (const role of selected) {
    if (original?.some((item) => item.id === role.id && item.slots === role.slots)) continue
    const saved = current.find((item) => item.roleId === role.id)
    if (!saved || saved.slots !== role.slots) {
      await projectsApi.setRole(projectId, role.id, { slots: role.slots })
    }
  }
  for (const saved of current) {
    if (!selected.some((role) => role.id === saved.roleId) && (!original || original.some((role) => role.id === saved.roleId))) {
      await projectsApi.removeRole(projectId, saved.roleId)
    }
  }
}

/** The server is the source of truth, including after a partially successful save. */
export async function syncProjectSkills(projectId: number, selected: SelectedSkill[]) {
  const current = (await projectsApi.get(projectId)).projectSkills
  for (const skill of selected) {
    const saved = current.find((item) => item.skillId === skill.id)
    if (!saved || saved.skillLevel !== skill.level) {
      await projectsApi.setSkill(projectId, skill.id, { skillLevel: skill.level })
    }
  }
  for (const saved of current) {
    if (!selected.some((skill) => skill.id === saved.skillId)) {
      await projectsApi.removeSkill(projectId, saved.skillId)
    }
  }
}

/** Create only once. A failed follow-up request can be retried without duplicating the project. */
export function useCreateProjectForm(viewerId: number, ideaId?: number) {
  const draft = useRef<{ id: number; roleId: number; status: ProjectStatus } | null>(null)
  const [createdId, setCreatedId] = useState<number | null>(null)

  const mutation = useProjectMutation(async (input: ProjectSubmission) => {
    const retry = !!draft.current
    if (!draft.current) {
      const created = ideaId
        ? await ideasApi.convert(ideaId, input.roleId)
        : await projectsApi.create({ ...input.fields, roleId: input.roleId })
      draft.current = { id: created.id, roleId: input.roleId, status: created.status }
      setCreatedId(created.id)
    }

    const id = draft.current.id
    if (retry || ideaId) {
      const updated = await projectsApi.update(id, input.fields)
      draft.current.status = updated.status
    }
    if (draft.current.status !== input.status) {
      const updated = await projectsApi.updateStatus(id, input.status)
      draft.current.status = updated.status
    }
    if (draft.current.roleId !== input.roleId) {
      await projectsApi.changeMemberRole(id, viewerId, input.roleId)
      draft.current.roleId = input.roleId
    }

    if (input.skills.length || retry || ideaId) await syncProjectSkills(id, input.skills)
    if (input.vacancies.length || retry) await syncProjectVacancies(id, input.vacancies)
    if (input.contribution !== undefined) {
      await projectsApi.updateContribution(id, input.contribution)
    }
    return id
  })

  return { mutation, createdId }
}
