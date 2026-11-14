import "@/app/styles/guest.css"

import GuestHeader from "@/shared/components/shared/guest/guest-header"

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-surface flow-root min-h-dvh">
      <GuestHeader />
      {children}
    </div>
  )
}
