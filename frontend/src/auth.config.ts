import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import type { NextAuthConfig } from "next-auth";

export default {
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'microsoft-entra-id') {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          const res = await fetch(`${baseUrl}/api/auth/oauth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              provider: account.provider,
              providerAccountId: account.providerAccountId
            })
          });
          const data = await res.json();
          if (res.ok && data.success && data.data?.user) {
            user.id = data.data.user.id;
            user.roles = data.data.user.roles || ["ENTREPRENEUR"];
            (user as any).token = data.data.token;
            return true;
          }
          return false;
        } catch(e) {
          console.error("OAuth backend sync error:", e);
          return false;
        }
      }
      return false;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.roles = (user as any).roles || ["ENTREPRENEUR"];
        token.backendToken = (user as any).token as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).roles = token.roles;
        (session.user as any).token = token.backendToken;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
