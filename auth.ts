import axios from "axios";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import type { User as AppUser } from "@/types/models";

interface OAuthLoginResponse {
  token: string;
  user?: AppUser;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account && account.provider !== "credentials") {
        const apiUrl = process.env.API_URL;
        const internalSecret = process.env.AUTH_INTERNAL_SECRET;

        if (!apiUrl || !internalSecret) {
          throw new Error("API_URL or AUTH_INTERNAL_SECRET is not defined");
        }

        const providerLogin =
          profile && "login" in profile && typeof profile.login === "string"
            ? profile.login
            : null;

        const { data } = await axios.post<OAuthLoginResponse>(
          `${apiUrl.replace(/\/$/, "")}/api/auth/oauth`,
          {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            providerLogin,
            name: user?.name ?? null,
            email: user?.email ?? null,
            image: user?.image ?? null,
          },
          {
            headers: {
              "X-Internal-Secret": internalSecret,
            },
          },
        );

        token.accessToken = data.token;

        if (data.user) {
          token.appUser = data.user;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : undefined;

      if (token.appUser && typeof token.appUser === "object") {
        session.appUser = token.appUser as AppUser;
      }

      return session;
    },
  },
});
