import Image from "next/image"
import Link from "next/link"
import { ProfileIcon } from "./profile-media"

import type { PortfolioWork } from "@/types/models"

export default function ProfilePortfolio({ works }: { works: PortfolioWork[] }) {
  if (!works.length) return null

  return (
    <ul aria-label="Личные работы" className="work-grid mt-[23px] grid gap-[18px] sm:grid-cols-2">
      {works.map((work) => {
        const href = work.url && /^https?:\/\//i.test(work.url) ? work.url : undefined
        return (
          <li
            key={work.id}
            className="overflow-hidden rounded-xl border border-account-stroke bg-account-panel"
          >
            {work.coverUrl && (
              <div className="relative h-[170px] bg-account-interaction">
                <Image
                  src={work.coverUrl}
                  fill
                  unoptimized
                  sizes="(max-width: 639px) 100vw, 340px"
                  className="object-cover"
                  alt=""
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-body-large leading-[22.5px] font-semibold tracking-[-.2px]">
                {work.projectId ? (
                  <Link href={`/projects/${work.projectId}`} className="hover:text-account-link">{work.title}</Link>
                ) : href ? (
                  <a
                    href={href}
                    rel="noreferrer"
                    className="flex items-center justify-between gap-2 hover:text-account-link"
                  >
                    {work.title}
                    <ProfileIcon file="external-link.svg" size={15} />
                  </a>
                ) : (
                  work.title
                )}
              </h3>
              {work.description && (
                <p className="mt-2 text-xs leading-[18px] text-account-copy">{work.description}</p>
              )}
              {work.contribution && (
                <p className="mt-4 text-caption leading-4 text-account-subtle">
                  {work.contribution}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
