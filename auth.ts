import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        try {
          const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: profile.email,
              name: profile.name,
              provider: account.provider,
              providerId: account.providerAccountId,
            }),
          });

          if (!backendResponse.ok) throw new Error("Backend auth failed");

          const backendData = await backendResponse.json();

          token.backendAccessToken = backendData.accessToken; 
          token.userId = backendData.user.id;
        } catch (error) {
          console.error("Error syncing with backend:", error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.backendAccessToken = token.backendAccessToken as string;
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
