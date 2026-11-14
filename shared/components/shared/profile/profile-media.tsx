import Image from "next/image"

export function ProfileIcon({ file, size }: { file: string; size: number }) {
  return (
    <Image
      src={`/icons/profile/${file}`}
      width={size}
      height={size}
      alt=""
      unoptimized
      className={file.endsWith(".svg") ? "shrink-0 dark:brightness-0 dark:invert" : "shrink-0"}
    />
  )
}

export function ProfileAvatar({
  name,
  url,
  size,
}: {
  name: string
  url?: string | null
  size: number
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
  return (
    <span
      style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center overflow-hidden rounded-full border border-stroke bg-selected font-medium text-link-accent"
    >
      {url && /^https?:\/\//i.test(url) ? (
        <Image
          src={url}
          alt=""
          width={size}
          height={size}
          unoptimized
          className="size-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  )
}
