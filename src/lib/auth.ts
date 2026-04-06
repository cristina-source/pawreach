import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import { prisma } from "./prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: { scope: "openid email profile" },
      },
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: "PawReach <noreply@pawreach.pt>",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      const allowed = await prisma.allowedEmail.findUnique({
        where: { email: user.email },
      })
      return !!allowed
    },
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
})
