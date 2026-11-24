import Link from "next/link"
import {
  Activity,
  ArrowUpRight,
  Boxes,
  ChevronRight,
  FolderKanban,
  Layers3,
  Lightbulb,
  LogOut,
  PanelsTopLeft,
  UsersRound,
} from "lucide-react"
import { leaveAccount } from "@/app/admin/actions"
import { catalog, kinds, type Kind } from "@/shared/lib/admin-catalog"

export const sectionIcons = { projects: FolderKanban, ideas: Lightbulb, communities: UsersRound }
export function AdminFrame({
  name,
  active,
  children,
}: {
  name: string
  active?: Kind
  children: React.ReactNode
}) {
  return (
    <div className="adm-layout">
      <aside className="adm-sidebar">
        <Link href="/admin" className="adm-brand">
          <span className="adm-brand-icon">
            <Layers3 size={24} />
          </span>
          TeamPlatform
        </Link>
        <nav aria-label="Администрирование">
          <span className="adm-nav-label">Рабочая область</span>
          <Link className="adm-nav-item" aria-current={!active ? "page" : undefined} href="/admin">
            <PanelsTopLeft /> Обзор
          </Link>
          <span className="adm-nav-label">Каталоги</span>
          {kinds.map((kind) => {
            const Icon = sectionIcons[kind]
            return (
              <Link
                key={kind}
                className="adm-nav-item"
                href={`/admin/${kind}`}
                aria-current={kind === active ? "page" : undefined}
              >
                <Icon />
                {catalog[kind].title}
              </Link>
            )
          })}
        </nav>
        <div className="adm-sidebar-foot">
          <Link href="/user" className="adm-nav-item">
            <ArrowUpRight /> На платформу
          </Link>
          <form action={leaveAccount}>
            <button className="adm-nav-item" type="submit">
              <LogOut /> Выйти из аккаунта
            </button>
          </form>
          <div className="adm-account">
            <span>{name.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{name}</strong>
              <small>Администратор</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="adm-workspace">
        <header className="adm-top">
          <div>
            <Boxes size={15} /> <Link href="/admin">Администрирование</Link> <ChevronRight size={13} />{" "}
            <strong>{active ? catalog[active].title : "Обзор"}</strong>
          </div>
          <Activity size={18} aria-hidden="true" />
        </header>
        <main className="adm-main">{children}</main>
      </div>
    </div>
  )
}
