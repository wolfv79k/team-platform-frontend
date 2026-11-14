import type { User as AppUser } from "@/types/models"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    appUser?: AppUser
  }
  interface User {
    accessToken?: string
    appUser?: AppUser
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    appUser?: AppUser
  }
}
