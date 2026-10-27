import NextAuth from "next-auth";
declare module "next-auth" {
  interface Session {
    backendAccessToken?: string;
    user: { id: string } & DefaultSession["user"];
  }
}
