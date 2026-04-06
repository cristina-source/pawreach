import type { NextAuthConfig } from "next-auth"

const PUBLIC_PATHS = ["/login", "/api/auth", "/api/webhooks"]

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublic = PUBLIC_PATHS.some((p) => nextUrl.pathname.startsWith(p))
      if (isPublic) return true
      if (!isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl)
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
        return Response.redirect(loginUrl)
      }
      return true
    },
  },
  providers: [],
}
