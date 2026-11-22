"use client"

import "@/app/styles/forms.css"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { catalogPreview } from "@/shared/data/catalog-preview"
import { BrowseLayout } from "@/shared/components/shared/layout/browse-layout"

const skills = ["ReactJS", "TypeScript", "Figma", "Node.js", "PostgreSQL", "Next.js"]
const levels = ["Начальный", "Средний", "Продвинутый"]
const titles = {
  ideas: "Новая идея",
  teams: "Новая команда",
  communities: "Новое сообщество",
  post: "Новая публикация",
}
const actions = {
  ideas: "Опубликовать идею",
  teams: "Создать команду",
  communities: "Создать сообщество",
  post: "Опубликовать",
}

function Field({
  name,
  label,
  placeholder,
  initial,
  required,
  type = "text",
  max = 100,
  hint,
}: {
  name: string
  label: string
  placeholder: string
  initial?: string
  required?: boolean
  type?: string
  max?: number
  hint?: string
}) {
  return (
    <div className="field">
      <label htmlFor={name}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={initial}
        required={required}
        type={type}
        maxLength={max}
        placeholder={placeholder}
      />
      {hint && <small>{hint}</small>}
    </div>
  )
}

function Description({
  label = "Описание",
  placeholder,
  initial,
  rows = 6,
  required,
}: {
  label?: string
  placeholder: string
  initial?: string
  rows?: number
  required?: boolean
}) {
  return (
    <div className="field">
      <label htmlFor="entity-description">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <textarea
        id="entity-description"
        name="description"
        rows={rows}
        defaultValue={initial}
        placeholder={placeholder}
        required={required}
      />
    </div>
  )
}

export default function EntityForm({
  kind,
  editId,
  communityId,
}: {
  kind: keyof typeof titles
  editId?: number
  communityId?: number
}) {
  const [notice, setNotice] = useState(false)
  const team =
    kind === "teams" ? catalogPreview.teams.find((item) => item.id === editId) : undefined
  const idea =
    kind === "ideas" ? catalogPreview.ideas.find((item) => item.id === editId) : undefined
  const community = catalogPreview.communities.find((item) => item.id === communityId)
  const title = team ? "Редактирование команды" : idea ? "Редактирование идеи" : titles[kind]
  const back =
    kind === "post" ? `/communities/${communityId}` : editId ? `/${kind}/${editId}` : `/${kind}`

  function submitPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(true)
  }

  return (
    <BrowseLayout title={title} back={back}>
      <form className="edit-form" onSubmit={submitPreview}>
        <section
          className={`form-section project-basics ${kind === "ideas" ? "idea-form-section" : ""}`}
        >
          <div className="form-intro">
            <h1>{title}</h1>
            <p>
              {kind === "teams"
                ? "Команда объединяет людей для совместной работы и участия в хакатонах."
                : kind === "ideas"
                  ? "Опиши, кому и в какой ситуации пригодится твоё решение."
                  : kind === "post"
                    ? `В сообществе «${community?.name ?? ""}»`
                    : "Объедини людей вокруг темы, которую хочется обсуждать."}
            </p>
          </div>
          {kind === "teams" && (
            <>
              <Field
                name="name"
                label="Название команды"
                placeholder="Как вас будут знать"
                initial={team?.name}
                required
              />
              <Description
                label="О команде"
                rows={5}
                placeholder="Чем хотите заниматься и кого будете рады видеть"
                initial={team?.description}
              />
              <div className="field">
                <label>Технологии команды</label>
                <small>Выбери навыки и укажи уровень команды.</small>
                <div className="skill-checkboxes">
                  {skills.map((skill) => (
                    <div key={skill} className="skill-option-row">
                      <label>
                        <input
                          type="checkbox"
                          name="teamSkills"
                          value={skill}
                          defaultChecked={team?.skills.includes(skill)}
                        />
                        {skill}
                      </label>
                      <select
                        aria-label={`Уровень ${skill}`}
                        defaultValue={
                          (team?.levels as Record<string, string> | undefined)?.[skill] ?? levels[0]
                        }
                      >
                        {levels.map((level) => (
                          <option key={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <div className="inline-note">
                {team
                  ? "Капитан управляет командой и рассматривает заявки."
                  : "Ты станешь капитаном команды. После создания можно пригласить участников."}
              </div>
            </>
          )}
          {kind === "ideas" && (
            <>
              <Field
                name="name"
                label="Название"
                placeholder="Например, карта кампуса"
                hint="До 100 символов"
                initial={idea?.name}
                required
              />
              <Description
                placeholder="Что сейчас неудобно и с чего можно начать?"
                initial={idea?.description}
              />
            </>
          )}
          {kind === "communities" && (
            <>
              <Field
                name="name"
                label="Название сообщества"
                placeholder="Короткое и узнаваемое название"
                required
              />
              <Description placeholder="О чём здесь говорят и кому будет полезно" />
              <div className="inline-note">
                После создания ты станешь участником и создателем сообщества.
              </div>
            </>
          )}
          {kind === "post" && (
            <>
              <Field name="title" label="Заголовок" placeholder="Необязательно" max={255} />
              <Description
                label="Текст"
                rows={10}
                placeholder="Расскажи о своём опыте или задай вопрос"
                required
              />
            </>
          )}
        </section>
        <footer className="form-footer">
          {notice && <p role="status">Отправка формы пока не подключена.</p>}
          <Link href={back} className="btn quiet">
            Отмена
          </Link>
          <button type="submit" className="btn primary">
            {editId ? "Сохранить" : actions[kind]}
          </button>
        </footer>
      </form>
    </BrowseLayout>
  )
}
