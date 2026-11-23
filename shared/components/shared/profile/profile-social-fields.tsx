import Image from "next/image"
import { Link2 } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import { socialFields } from "@/shared/lib/profile-settings"
import { GithubConnectButton, GithubConnectionNotice } from "./github-connect-button"

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
          <div key={key} className="flex min-w-0 items-center gap-2">
            <div className={`min-w-0 flex-1 social-field${icon ? " has-icon" : ""}`}>
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
                readOnly={key === "github"}
                onChange={
                  key === "github" ? undefined : (event) => onChange(key, event.target.value)
                }
                placeholder={key === "github" ? "Подключите GitHub" : placeholder}
                className="shadow-none"
              />
            </div>
            {key === "github" && (
              <GithubConnectButton
                value={fields.github}
                onDisconnect={() => onChange("github", "")}
                disabled={disabled}
                className="shrink-0"
                settings
              />
            )}
          </div>
        ))}
      </div>
      <GithubConnectionNotice connected={!!fields.github} />
    </section>
  )
}
