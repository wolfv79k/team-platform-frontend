import "@/app/styles/catalog.css"
import "@/app/styles/catalog-details.css"

import Image from "next/image"

export type CatalogPhoto = { src: string; width: number; height: number; alt: string }

export function PhotoCover({
  photo,
  className = "",
  decorative = true,
}: {
  photo: CatalogPhoto
  className?: string
  decorative?: boolean
}) {
  return (
    <Image
      src={photo.src.replace("assets/photos/", "/photos/")}
      width={photo.width}
      height={photo.height}
      alt={decorative ? "" : photo.alt}
      className={className}
      unoptimized
    />
  )
}
