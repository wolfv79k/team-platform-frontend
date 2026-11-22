"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Users } from "lucide-react"
import { BrowseLayout } from "@/shared/components/shared/layout/browse-layout"
import {
  FormField,
  FormHeading,
  FormSection,
  ProjectFormFooter,
  SkillsField,
} from "./project-form-fields"
import { formValue, type SelectedSkill } from "@/shared/lib/project-form-submit"
import { TeamPreviewNotice, useTeamPreview, type TeamView } from "./team-preview-provider"

function TeamEditor({ team }: { team?: TeamView }) {
  const router = useRouter()
  const preview = useTeamPreview()
  const [skills, setSkills] = useState<SelectedSkill[]>(
    () => team?.teamSkills.map(({ skill, skillLevel }) => ({ ...skill, level: skillLevel })) ?? [],
  )
  const [error, setError] = useState("")
  const back = team ? `/teams/${team.id}` : "/teams"

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const input = {
      name: formValue(data, "name"),
      description: formValue(data, "description"),
      skills,
    }
    try {
      if (team) {
        preview.edit(team.id, input)
        router.push(back)
      } else {
        const id = preview.create(input)
        router.push(`/teams/${id}`)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось сохранить изменения.")
    }
  }

  return (
    <form className="project-form" onSubmit={submit}>
      <FormHeading
        icon={team ? Pencil : Users}
        title={team ? "Редактировать команду" : "Создать команду"}
        description="Объедини людей для совместной работы и участия в хакатонах."
      />
      <TeamPreviewNotice />
      <FormSection title="Основная информация">
        <FormField
          name="name"
          label="Название команды"
          required
          max={100}
          initial={team?.name}
          placeholder="Как вас будут знать"
        />
        <FormField
          name="description"
          label="О команде"
          rows={5}
          initial={team?.description}
          placeholder="Чем занимаетесь и кого будете рады видеть"
        />
      </FormSection>
      <FormSection
        title="Технологии команды"
        description="Выбери технологии и уровень навыков команды."
      >
        <SkillsField
          id="team-skill-search"
          value={skills}
          onChange={setSkills}
          dictionary={preview.skills}
        />
      </FormSection>
      <ProjectFormFooter
        back={back}
        submitLabel={team ? "Сохранить в демо" : "Создать в демо"}
        pending={false}
        error={error}
      />
    </form>
  )
}

export default function TeamForm({ id }: { id?: number }) {
  const { teams, viewerId } = useTeamPreview()
  const team = teams.find((item) => item.id === id)
  const unavailable = id !== undefined && (!team || team.captainId !== viewerId)
  return (
    <BrowseLayout
      title={id === undefined ? "Команды › Создание" : "Редактирование команды"}
      back={id === undefined ? "/teams" : `/teams/${id}`}
    >
      {unavailable ? (
        <section className="project-form">
          <TeamPreviewNotice />
          <div className="empty-tab">
            <h2>{team ? "Редактировать может капитан" : "Команда не найдена"}</h2>
          </div>
        </section>
      ) : (
        <TeamEditor key={`${id ?? "new"}-${viewerId}`} team={team} />
      )}
    </BrowseLayout>
  )
}
