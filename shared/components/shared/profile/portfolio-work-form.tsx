"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Briefcase, Info } from "lucide-react"
import { apiErrorMessage } from "@/services/api-error"
import { ProjectStatus } from "@/types/enums"
import {
  formValue,
  readProjectFields,
  readProjectStatus,
  useCreateProjectForm,
  validateProjectFields,
  type SelectedSkill,
} from "@/shared/lib/project-form-submit"
import {
  FormField,
  FormHeading,
  FormSection,
  ProjectFormFooter,
  ProjectMediaField,
  RoleField,
  SkillsField,
  StatusField,
} from "@/shared/components/shared/catalog/project-form-fields"

export default function PortfolioWorkForm({ viewerId }: { viewerId: number }) {
  const router = useRouter()
  const [skills, setSkills] = useState<SelectedSkill[]>([])
  const [status, setStatus] = useState(ProjectStatus.ENDED)
  const [validation, setValidation] = useState("")
  const { mutation, createdId } = useCreateProjectForm(viewerId)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mutation.isPending) return
    const data = new FormData(event.currentTarget)
    const fields = readProjectFields(data)
    const roleId = Number(formValue(data, "roleId"))
    const error = validateProjectFields(fields) || (!Number.isInteger(roleId) || roleId < 1 ? "Выберите свою роль в работе." : "")
    setValidation(error)
    if (error) return
    try {
      await mutation.mutateAsync({
        fields,
        roleId,
        status: readProjectStatus(data, status),
        skills,
        vacancies: [],
        contribution: formValue(data, "contribution"),
      })
      router.push("/user")
      router.refresh()
    } catch {
      /* the API error is rendered below */
    }
  }

  return (
    <form className="project-form" onSubmit={submit}>
      <FormHeading
        icon={Briefcase}
        title="Добавить работу"
        description="Расскажи о личном проекте, учебной работе или кейсе, которым гордишься."
      />
      <fieldset className="project-form-content" disabled={mutation.isPending}>
        <FormSection title="О работе" description="Помоги другим быстро понять, что ты создал.">
          <FormField
            name="name"
            label="Название работы"
            required
            max={100}
            placeholder="Например, интернет-магазин мебели"
          />
          <FormField
            name="slogan"
            label="Короткое описание"
            max={160}
            placeholder="Суть проекта в одном предложении"
            hint="До 160 символов"
          />
          <FormField
            name="description"
            label="Описание проекта"
            rows={5}
            placeholder="Цель проекта, процесс разработки и результат"
          />
          <div className="project-form-grid">
            <RoleField label="Твоя роль в работе" />
            <StatusField value={status} onChange={setStatus} personal />
          </div>
        </FormSection>
        <FormSection
          title="Твой вклад"
          description="Покажи, какие задачи решал и какие навыки использовал."
        >
          <FormField
            name="contribution"
            label="Что ты сделал"
            rows={4}
            max={1000}
            placeholder="Например, разработал интерфейс, настроил API и интегрировал базу данных"
            hint="До 1000 символов"
          />
          <SkillsField personal value={skills} onChange={setSkills} disabled={mutation.isPending} />
        </FormSection>
        <FormSection
          title="Ссылки"
          description="Необязательно. Добавь ссылку на результат или демонстрацию."
        >
          <FormField
            name="projectUrl"
            label="Сайт, репозиторий или кейс"
            type="url"
            max={500}
            placeholder="https://github.com/..."
          />
        </FormSection>
        <ProjectMediaField />
        <div className="project-form-note">
          <Info size={16} />
          <p>
            Работа также появится в общем каталоге. При необходимости на странице проекта можно
            открыть набор участников.
          </p>
        </div>
      </fieldset>
      <ProjectFormFooter
        back="/user"
        submitLabel="Добавить в портфолио"
        pending={mutation.isPending}
        error={validation || (mutation.isError ? apiErrorMessage(mutation.error) : "")}
        createdId={createdId}
      />
    </form>
  )
}
