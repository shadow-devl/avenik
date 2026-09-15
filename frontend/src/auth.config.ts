import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

export default {
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        // This is a placeholder for custom credential logic via backend API
        // For Edge runtime compatibility in middleware, we don't call Prisma here directly 
        // if this authorize is invoked from edge. Typically Credentials is not invoked on edge.
        // For the sake of the demo and edge compatibility, we mock the return or we should fetch via standard `fetch()` to our backend.
        
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          const res = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });
          const data = await res.json();
          if (res.ok && data.success && data.data?.user) {
            return {
              id: data.data.user.id,
              email: data.data.user.email,
              name: data.data.user.name,
              roles: data.data.user.roles || ["ENTREPRENEUR"],
              token: data.data.token,
            };
          }
          return null;
        } catch(e) {
          console.error("Auth fetch error:", e);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as any).roles || ["ENTREPRENEUR"];
        token.backendToken = (user as any).token;
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
