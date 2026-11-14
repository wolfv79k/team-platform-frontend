import { ChevronDown, Plus, Tags, X } from "lucide-react"
import { Combobox } from "@base-ui/react/combobox"
import type { Skill } from "@/types/models"

export function ProfileSkillsField({
  skills,
  selectedSkills,
  toggleSkill,
  saving,
}: {
  skills: Skill[]
  selectedSkills: number[]
  toggleSkill: (id: number) => void
  saving: boolean
}) {
  const skillNames = new Map(skills.map(({ id, name }) => [id, name]))
  const availableSkills = skills.filter(({ id }) => !selectedSkills.includes(id))

  return (
    <section className="form-section">
      <div className="settings-section-title">
        <Tags size={13} aria-hidden="true" />
        <h2>Теги и технологии</h2>
      </div>

      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="profile-technologies" className="text-xs font-medium text-ink">
          Технологии и навыки
        </label>
        <span className="text-caption text-link-accent">{selectedSkills.length} из 10</span>
      </div>

      <Combobox.Root<Skill>
        items={availableSkills}
        itemToStringLabel={(skill) => skill.name}
        value={null}
        onValueChange={(skill) => {
          if (skill) toggleSkill(skill.id)
        }}
        openOnInputClick
        autoHighlight
        disabled={saving || selectedSkills.length >= 10}
      >
        <Combobox.InputGroup className="relative">
          <Combobox.Input
            id="profile-technologies"
            placeholder={
              selectedSkills.length >= 10 ? "Достигнут лимит навыков" : "Найти технологию или навык"
            }
            className="h-10 w-full rounded-lg border border-stroke bg-control px-3 pr-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-action disabled:bg-interaction"
          />
          <Combobox.Trigger
            type="button"
            aria-label="Открыть список навыков"
            className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-lg text-subtle hover:text-link-accent focus-visible:ring-2 focus-visible:ring-action"
          >
            <ChevronDown size={16} aria-hidden="true" />
          </Combobox.Trigger>
        </Combobox.InputGroup>
        <Combobox.Portal>
          <Combobox.Positioner sideOffset={5} className="z-[60] w-[var(--anchor-width)]">
            <Combobox.Popup className="settings-skill-popup">
              <Combobox.Empty className="px-3 py-3 text-xs text-subtle empty:hidden">
                Навыки не найдены.
              </Combobox.Empty>
              <Combobox.List className="max-h-[min(14rem,var(--available-height))] overflow-y-auto overscroll-contain p-1 empty:hidden">
                {(skill: Skill) => (
                  <Combobox.Item
                    key={skill.id}
                    value={skill}
                    className="flex min-h-9 cursor-pointer items-center justify-between gap-2 rounded-md px-2 text-xs outline-none"
                  >
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
        <div className="mt-3">
          <p className="mb-2 text-xs text-subtle">Выбранные навыки</p>
          <ul aria-label="Выбранные навыки" className="flex flex-wrap gap-1.5">
            {selectedSkills.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => toggleSkill(id)}
                  aria-label={`Убрать ${skillNames.get(id) ?? "навык"}`}
                  className="settings-chip"
                >
                  {skillNames.get(id) ?? "Навык недоступен"}
                  <X size={12} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {availableSkills.length > 0 && selectedSkills.length < 10 && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-subtle">Быстрый выбор</p>
          <div className="flex flex-wrap gap-1.5">
            {availableSkills.slice(0, 5).map((skill) => (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggleSkill(skill.id)}
                className="settings-chip"
              >
                {skill.name}
                <Plus size={12} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
