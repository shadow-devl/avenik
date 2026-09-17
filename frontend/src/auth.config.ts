import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

export default {
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "missing_google_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "missing_google_client_secret",
    }),
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID || "missing_ms_client_id",
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET || "missing_ms_secret",
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER || "https://login.microsoftonline.com/common/v2.0",
    }),
    Credentials({
      name: "Development Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@avenik.com" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        return {
          id: "dev-user-id",
          email: credentials.email as string,
          name: "Demo Entrepreneur",
        };
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'credentials') {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          // Send an oauth request pretending it's credentials
          const res = await fetch(`${baseUrl}/api/auth/oauth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name || 'Demo User',
              provider: 'credentials',
              providerAccountId: user.email // use email as ID
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
          console.error("Credentials backend sync error:", e);
          return false;
        }
      }

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
