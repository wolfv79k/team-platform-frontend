import "@/app/styles/catalog.css"
import "@/app/styles/catalog-details.css"

export function Tag({ children, tone = "" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`tag ${tone}`}>{children}</span>
}

export function Skills({ names }: { names: string[] }) {
  if (!names.length) return null
  return (
    <div className="mini-skills">
      {names.map((name) => (
        <Tag key={name}>{name}</Tag>
      ))}
    </div>
  )
}
