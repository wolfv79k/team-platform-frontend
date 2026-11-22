"use client"

import "@/app/styles/skill-picker.css"
import { useState, useSyncExternalStore } from "react"
import { ChevronDown, Plus, X } from "lucide-react"
import { Combobox } from "@base-ui/react/combobox"
import type { Skill } from "@/types/models"
const subscribeToHydration = () => () => {}

/** Identical selection UX for the profile and project forms. */
export function SkillPicker({
  id,
  label,
  skills,
  selectedSkills,
  toggleSkill,
  disabled = false,
  limit,
  loading = false,
}: {
  id: string
  label: string
  skills: Skill[]
  selectedSkills: number[]
  toggleSkill: (id: number) => void
  disabled?: boolean
  limit?: number
  loading?: boolean
}) {
  const [search, setSearch] = useState("")
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  )
  const available = skills.filter(({ id }) => !selectedSkills.includes(id))
  const names = new Map(skills.map(({ id, name }) => [id, name]))
  const atLimit = limit !== undefined && selectedSkills.length >= limit
  const canAdd = hydrated && !disabled && !loading && !atLimit && available.length > 0

  function add(skill: Skill) {
    if (!canAdd || selectedSkills.includes(skill.id)) return
    toggleSkill(skill.id)
    setSearch("")
  }

  return (
    <div className="skill-picker">
      <div className="skill-picker-label">
        <label htmlFor={id}>{label}</label>
        <span>
          {limit === undefined
            ? `${selectedSkills.length} выбрано`
            : `${selectedSkills.length} из ${limit}`}
        </span>
      </div>
      <Combobox.Root<Skill>
        items={available}
        itemToStringLabel={(skill) => skill.name}
        isItemEqualToValue={(a, b) => a.id === b.id}
        value={null}
        inputValue={search}
        onInputValueChange={setSearch}
        onValueChange={(skill) => {
          if (skill) add(skill)
        }}
        openOnInputClick
        autoHighlight
        disabled={!canAdd}
      >
        <Combobox.InputGroup className="skill-picker-input-group">
          <Combobox.Input
            id={id}
            className="skill-picker-input"
            placeholder={
              loading
                ? "Загрузка технологий…"
                : atLimit
                  ? "Достигнут лимит навыков"
                  : !available.length
                    ? "Нет доступных навыков"
                    : "Найти технологию или навык"
            }
          />
          <Combobox.Trigger
            type="button"
            className="skill-picker-trigger"
            aria-label="Открыть список навыков"
          >
            <ChevronDown size={16} aria-hidden="true" />
          </Combobox.Trigger>
        </Combobox.InputGroup>
        <Combobox.Portal>
          <Combobox.Positioner sideOffset={5} className="z-[60] w-[var(--anchor-width)]">
            <Combobox.Popup className="settings-skill-popup skill-picker-popup">
              <Combobox.Empty className="skill-picker-empty">Навыки не найдены.</Combobox.Empty>
              <Combobox.List className="skill-picker-list">
                {(skill: Skill) => (
                  <Combobox.Item key={skill.id} value={skill} className="skill-picker-option">
                    {skill.name}
                    <Plus size={14} aria-hidden="true" />
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
      {selectedSkills.length > 0 && (
        <div className="skill-picker-group">
          <p>Выбранные навыки</p>
          <ul aria-label="Выбранные навыки" className="skill-picker-chips">
            {selectedSkills.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  className="skill-picker-chip is-selected"
                  disabled={disabled || !hydrated}
                  onClick={() => toggleSkill(id)}
                  aria-label={`Убрать ${names.get(id) ?? "навык"}`}
                >
                  {names.get(id) ?? "Навык недоступен"}
                  <X size={12} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {available.length > 0 && !atLimit && (
        <div className="skill-picker-group">
          <p>Быстрый выбор</p>
          <div className="skill-picker-chips">
            {available.slice(0, 5).map((skill) => (
              <button
                key={skill.id}
                type="button"
                className="skill-picker-chip"
                disabled={!canAdd}
                onClick={() => add(skill)}
                aria-label={`Добавить ${skill.name}`}
              >
                {skill.name}
                <Plus size={12} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
