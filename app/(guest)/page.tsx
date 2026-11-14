import { auth } from "@/auth"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Icon } from "@/shared/components/ui/icon"
import { PhotoCover } from "@/shared/components/shared/catalog/catalog-media"
import { catalogPreview } from "@/shared/data/catalog-preview"

export default async function Home() {
  const session = await auth()

  return (
    <main className="landing">
      <section className="home-hero">
        <h1>
          Здесь начало твоей
          <br />
          <span className="hero-highlight">IT карьеры</span>
        </h1>
        <p>
          Платформа для развития в IT через реальные проекты,
          <br className="desktop-break" /> команды, идеи и практику.
        </p>
        <Link href={session?.accessToken ? "/user" : "/register"} className="btn primary">
          <Icon icon={ArrowRight} />
          Начать
        </Link>
        <figure className="wide-photo home-photo">
          <PhotoCover photo={catalogPreview.photos.home} decorative={false} />
        </figure>
      </section>
    </main>
  )
}
