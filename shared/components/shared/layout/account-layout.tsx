"use client"

import "@/app/styles/personal-profile.css"

import { usePathname } from "next/navigation"
import { Container } from "./container"
import ProfileNavigation from "@/shared/components/shared/profile/profile-navigation"

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/user" || pathname.startsWith("/user/settings/")) {
    return (
      <main className="account-surface min-h-dvh bg-account-page text-account-ink">
        <Container className="flex max-w-[1440px]">
          <ProfileNavigation />
          {children}
        </Container>
      </main>
    )
  }

  return children
}
