import Image from "next/image"
import { Link2 } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import { socialFields } from "@/shared/lib/profile-settings"

type SocialField = (typeof socialFields)[number]["key"]

export function ProfileSocialFields({
  fields,
  onChange,
  disabled,
}: {
  fields: Record<SocialField, string>
  onChange: (key: SocialField, value: string) => void
  disabled: boolean
}) {
  return (
    <section className="form-section">
      <div className="settings-section-title">
        <Link2 size={13} aria-hidden="true" />
        <h2>Ссылки на соцсети</h2>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {socialFields.map(({ key, label, icon, placeholder }) => (
          <div key={key} className={icon ? "social-field has-icon" : "social-field"}>
            {icon && <Image width={18} height={18} src={icon} alt="" />}

            <label htmlFor={`social-${key}`} className="sr-only">
              {label}
            </label>

            <Input
              id={`social-${key}`}
              disabled={disabled}
              inputMode="url"
              maxLength={500}
              value={fields[key]}
              onChange={(event) => onChange(key, event.target.value)}
              placeholder={placeholder}
              className="shadow-none"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
