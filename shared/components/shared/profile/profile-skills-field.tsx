import { Tags } from "lucide-react"
import { SkillPicker } from "@/shared/components/shared/skill-picker"
import type { Skill } from "@/types/models"
import { SkillLevel } from "@/types/enums"
import { levelLabels } from "@/shared/lib/project-display"
import type { ProfileSettings } from "@/shared/lib/profile-settings"

export function ProfileSkillsField({
  skills,
  selectedSkills,
  toggleSkill,
  changeSkillLevel,
  saving,
}: {
  skills: Skill[]
  selectedSkills: ProfileSettings["userSkills"]
  toggleSkill: (id: number) => void
  changeSkillLevel: (id: number, level: SkillLevel) => void
  saving: boolean
}) {
  return (
    <section className="form-section">
      <div className="settings-section-title">
        <Tags size={13} aria-hidden="true" />
        <h2>Теги и технологии</h2>
      </div>

      <SkillPicker
        id="profile-technologies"
        label="Технологии и навыки"
        skills={skills}
        selectedSkills={selectedSkills.map(({ skillId }) => skillId)}
        toggleSkill={toggleSkill}
        disabled={saving}
        limit={10}
      />
      {!!selectedSkills.length && (
        <details className="mt-4 rounded-lg border border-stroke p-3">
          <summary className="cursor-pointer text-xs font-medium text-ink">Уровни навыков</summary>
          <div className="mt-3 grid gap-2">
            {selectedSkills.map(({ skillId, skillLevel }) => {
              const name = skills.find((skill) => skill.id === skillId)?.name ?? "Навык"
              return (
                <label
                  key={skillId}
                  className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink"
                >
                  {name}
                  <select
                    aria-label={`Уровень владения: ${name}`}
                    value={skillLevel}
                    disabled={saving}
                    onChange={(event) =>
                      changeSkillLevel(skillId, event.target.value as SkillLevel)
                    }
                    className="h-8 rounded-md border border-stroke bg-control px-2 text-xs text-ink"
                  >
                    {Object.values(SkillLevel).map((level) => (
                      <option key={level} value={level}>
                        {levelLabels[level]}
                      </option>
                    ))}
                  </select>
                </label>
              )
            })}
          </div>
        </details>
      )}
    </section>
  )
}
