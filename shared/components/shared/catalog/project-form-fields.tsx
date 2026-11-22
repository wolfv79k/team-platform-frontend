"use client"

import "@/app/styles/project-form.css"
import { Combobox } from "@base-ui/react/combobox"
import { ArrowUpRight, ChevronDown, Plus, Video, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useState, useSyncExternalStore, type ReactNode } from "react"
import Link from "next/link"
import { useRoles, useSkills } from "@/shared/lib/project-queries"
import { httpUrl, levelLabels, statusLabels } from "@/shared/lib/project-display"
import type { SelectedSkill, SelectedVacancy } from "@/shared/lib/project-form-submit"
import { ProjectStatus, SkillLevel } from "@/types/enums"
import { SkillPicker } from "@/shared/components/shared/skill-picker"
import type { Skill } from "@/types/models"

type Option = { id: number; name: string }
const subscribeToHydration = () => () => {}

export function FormHeading({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <header className="project-form-heading">
      <div className="project-form-heading-icon">
        <Icon size={21} strokeWidth={1.7} />
      </div>
      <div className="project-form-heading-copy">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  )
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="project-form-card">
      <div className="project-form-section-heading">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      <div className="project-form-fields">{children}</div>
    </section>
  )
}

export function FormField({
  name,
  label,
  initial,
  required,
  type = "text",
  max,
  placeholder,
  hint,
  rows,
}: {
  name: string
  label: string
  initial?: string | null
  required?: boolean
  type?: string
  max?: number
  placeholder?: string
  hint?: string
  rows?: number
}) {
  return (
    <div className="project-form-field">
      <label htmlFor={name}>
        {label}
        {required && <span className="required"> *</span>}
      </label>
      {rows ? (
        <textarea
          id={name}
          name={name}
          defaultValue={initial ?? ""}
          required={required}
          maxLength={max}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          id={name}
          name={name}
          defaultValue={initial ?? ""}
          required={required}
          type={type}
          maxLength={max}
          placeholder={placeholder}
        />
      )}
      {hint && <small>{hint}</small>}
    </div>
  )
}

export function RoleField({ label = "Ваша роль", initial }: { label?: string; initial?: Option }) {
  const roles = useRoles()
  const options = [...(roles.data ?? [])]
  if (initial && !options.some((role) => role.id === initial.id)) options.push(initial)
  return (
    <div className="project-form-field">
      <label htmlFor="roleId">
        {label}
        <span className="required"> *</span>
      </label>
      <select id="roleId" name="roleId" required defaultValue={initial?.id ?? ""} disabled={!options.length}>
        <option value="">{roles.isPending ? "Загрузка ролей…" : roles.isError ? "Роли недоступны" : options.length ? "Выберите роль" : "Справочник ролей пуст"}</option>
        {options.map((role) => (
          <option value={role.id} key={role.id}>
            {role.name}
          </option>
        ))}
      </select>
      {roles.isError && (
        <button type="button" className="project-form-text-button" onClick={() => roles.refetch()}>
          Не удалось загрузить роли. Повторить
        </button>
      )}
    </div>
  )
}

export function StatusField({
  value,
  onChange,
  personal = false,
}: {
  value: ProjectStatus
  onChange: (status: ProjectStatus) => void
  personal?: boolean
}) {
  const statuses = Object.values(ProjectStatus)
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  )
  return (
    <div className="project-form-field">
      <label htmlFor="status">Статус {personal ? "работы" : "проекта"}</label>
      <select
        id="status"
        name="status"
        value={value}
        disabled={!hydrated}
        onChange={(event) => onChange(event.target.value as ProjectStatus)}
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {statusLabels[status]}
          </option>
        ))}
      </select>
    </div>
  )
}

function OptionPicker({
  id,
  options,
  placeholder,
  onSelect,
  disabled,
}: {
  id: string
  options: Option[]
  placeholder: string
  onSelect: (option: Option) => void
  disabled?: boolean
}) {
  const [search, setSearch] = useState("")
  return (
    <Combobox.Root<Option>
      items={options}
      itemToStringLabel={(option) => option.name}
      isItemEqualToValue={(a, b) => a.id === b.id}
      value={null}
      inputValue={search}
      onInputValueChange={setSearch}
      onValueChange={(option) => {
        if (option) {
          onSelect(option)
          setSearch("")
        }
      }}
      openOnInputClick
      autoHighlight
        disabled={disabled || !options.length}
    >
      <Combobox.InputGroup className="project-form-combobox">
        <Combobox.Input id={id} placeholder={placeholder} />
        <Combobox.Trigger
          className="project-form-picker-trigger"
          type="button"
          aria-label="Открыть список"
        >
          <ChevronDown size={16} />
        </Combobox.Trigger>
      </Combobox.InputGroup>
      <Combobox.Portal>
        <Combobox.Positioner sideOffset={5} className="z-[60] w-[var(--anchor-width)]">
          <Combobox.Popup className="settings-skill-popup project-form-popup">
            <Combobox.Empty className="project-form-picker-empty">Ничего не найдено</Combobox.Empty>
            <Combobox.List className="project-form-picker-list">
              {(option: Option) => (
                <Combobox.Item
                  key={option.id}
                  value={option}
                  className="project-form-picker-option"
                >
                  {option.name}
                  <Plus size={14} />
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}

export function SkillsField({
  value,
  onChange,
  personal = false,
  disabled = false,
  id = "form-skill-search",
  dictionary,
}: {
  value: SelectedSkill[]
  onChange: (skills: SelectedSkill[]) => void
  personal?: boolean
  disabled?: boolean
  id?: string
  dictionary?: Skill[]
}) {
  const skills = useSkills(dictionary === undefined)
  const source = dictionary ?? skills.data ?? []
  const loading = dictionary === undefined && skills.isPending
  const failed = dictionary === undefined && skills.isError
  // Keep the existing selection visible even when the dictionary is still loading.
  const options = [
    ...source,
    ...value.filter((selected) => !source.some((skill) => skill.id === selected.id)),
  ]
  return (
    <div className="project-form-field">
      <SkillPicker
        id={id}
        label={personal ? "Использованные технологии" : "Технологии и навыки"}
        skills={options}
        selectedSkills={value.map((skill) => skill.id)}
        disabled={disabled}
        loading={loading}
        toggleSkill={(skillId) => {
          if (value.some((skill) => skill.id === skillId))
            onChange(value.filter((skill) => skill.id !== skillId))
          else {
            const skill = options.find((skill) => skill.id === skillId)
            if (skill)
              onChange([...value, { id: skill.id, name: skill.name, level: SkillLevel.BEGINNER }])
          }
        }}
      />
      {failed && (
        <button type="button" className="project-form-text-button" onClick={() => skills.refetch()}>
          Не удалось загрузить навыки. Повторить
        </button>
      )}
      {!loading && !failed && !options.length && (
        <small>Справочник технологий пока пуст.</small>
      )}
      {!!value.length && (
        <details className="project-form-skill-levels">
          <summary>
            Уровни навыков <ChevronDown size={14} aria-hidden="true" />
          </summary>
          <div className="project-form-selected-list">
            {value.map((skill) => (
              <div
                key={skill.id}
                className="project-form-selected-row project-form-skill-level-row"
              >
                <span className="project-form-selected-name">{skill.name}</span>
                <select
                  aria-label={`${personal ? "Уровень владения" : "Требуемый уровень"}: ${skill.name}`}
                  value={skill.level}
                  disabled={disabled}
                  onChange={(event) =>
                    onChange(
                      value.map((item) =>
                        item.id === skill.id
                          ? { ...item, level: event.target.value as SkillLevel }
                          : item,
                      ),
                    )
                  }
                >
                  {Object.values(SkillLevel).map((level) => (
                    <option key={level} value={level}>
                      {levelLabels[level]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </details>
      )}
      <small>Технологии выбираются из справочника. Уровень по умолчанию — начальный.</small>
    </div>
  )
}

/** Only videoUrl is writable through the current project API. */
export function ProjectMediaField({ videoUrl }: { videoUrl?: string | null }) {
  const [video, setVideo] = useState(videoUrl ?? "")
  const previewUrl = httpUrl(video.trim())

  return (
    <FormSection title="Медиа" description="Добавь видеопрезентацию проекта.">
      <div className="project-form-field">
        <label htmlFor="videoUrl">
          <Video size={15} aria-hidden="true" /> Ссылка на видео
        </label>
        <input
          id="videoUrl"
          name="videoUrl"
          type="url"
          maxLength={500}
          value={video}
          onChange={(event) => setVideo(event.target.value)}
          placeholder="https://youtube.com/..."
        />
        <small>Ссылка будет доступна другим пользователям на странице проекта.</small>
        {previewUrl && (
          <a
            className="project-form-video-preview"
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Video size={18} />
            <span>Открыть видео</span>
            <ArrowUpRight size={14} />
          </a>
        )}
      </div>
    </FormSection>
  )
}

export function VacanciesField({
  value,
  onChange,
  existing = [],
}: {
  value: SelectedVacancy[]
  onChange: (roles: SelectedVacancy[]) => void
  existing?: SelectedVacancy[]
}) {
  const roles = useRoles()
  const available = (roles.data ?? []).filter(
    (role) => !value.some((selected) => selected.id === role.id),
  )
  return (
    <div className="project-form-field">
      <label htmlFor="form-vacancy-search">Открытые роли</label>
      <OptionPicker
        id="form-vacancy-search"
        options={available}
        disabled={roles.isPending}
        placeholder={roles.isPending ? "Загрузка ролей…" : roles.isError ? "Роли недоступны" : available.length ? "Найти и добавить роль" : "Нет доступных ролей"}
        onSelect={(role) => onChange([...value, { id: role.id, name: role.name, slots: 1 }])}
      />
      {roles.isError && (
        <button type="button" className="project-form-text-button" onClick={() => roles.refetch()}>
          Повторить загрузку ролей
        </button>
      )}
      {!!value.length && (
        <div className="project-form-selected-list">
          {value.map((role) => (
            <div className="project-form-selected-row project-form-vacancy-row" key={role.id}>
              <span className="project-form-selected-name">{role.name}</span>
              <div className="project-form-seat">
                <span>Мест</span>
                <input
                  type="number"
                  aria-label={`Количество мест: ${role.name}`}
                  min={existing.some((item) => item.id === role.id && item.slots === 0) ? 0 : 1}
                  max={20}
                  required
                  step={1}
                  value={Number.isNaN(role.slots) ? "" : role.slots}
                  onChange={(event) =>
                    onChange(
                      value.map((item) =>
                        item.id === role.id ? { ...item, slots: event.target.valueAsNumber } : item,
                      ),
                    )
                  }
                />
              </div>
              <button
                type="button"
                className="project-form-remove"
                aria-label={`Убрать ${role.name}`}
                onClick={() => onChange(value.filter((item) => item.id !== role.id))}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      <small>Необязательно. Если пока не ищете участников, оставьте поле пустым.</small>
    </div>
  )
}

export function ProjectFormFooter({
  back,
  submitLabel,
  pending,
  blocked,
  error,
  createdId,
}: {
  back: string
  submitLabel: string
  pending: boolean
  blocked?: boolean
  error?: string
  createdId?: number | null
}) {
  return (
    <footer className="project-form-actions">
      {error && (
        <div className="project-form-error" role="alert">
          <p>{error}</p>
          {createdId && (
            <p>
              Проект уже создан. Повторите сохранение оставшихся данных или{" "}
              <Link href={`/projects/${createdId}`}>откройте проект</Link>.
            </p>
          )}
        </div>
      )}
      <div className="project-form-action-buttons">
        <Link className="btn secondary" href={createdId ? `/projects/${createdId}` : back}>
          {createdId ? "Открыть проект" : "Отмена"}
        </Link>
        <button className="btn primary" type="submit" disabled={pending || blocked}>
          {pending ? "Сохраняем…" : createdId ? "Завершить сохранение" : submitLabel}
        </button>
      </div>
    </footer>
  )
}
