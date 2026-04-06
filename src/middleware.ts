import NextAuth from "next-auth"
import { authConfig } from "./lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

// Rate limiting em memória — adequado para MVP (sem Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMITED_ROUTES = ["/api/ia/gerar", "/api/contactos/importar"]
const RATE_LIMIT_MAX = 20       // máx pedidos por janela
const RATE_LIMIT_WINDOW = 60_000 // janela de 60 segundos

function checkRateLimit(ip: string, pathname: string): boolean {
  const isLimited = RATE_LIMITED_ROUTES.some((r) => pathname.startsWith(r))
  if (!isLimited) return true

  const key = `${ip}:${pathname.split("/").slice(0, 3).join("/")}`
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) return false

  entry.count++
  return true
}

const isDevPreview =
  process.env.DEV_PREVIEW === "true" && process.env.NODE_ENV !== "production"

function withPathname(req: Request) {
  const url = new URL(req.url)
  const res = NextResponse.next()
  res.headers.set("x-pathname", url.pathname)
  return res
}

export default isDevPreview
  ? (req: Request) => withPathname(req)
  : auth((req) => {
      const { pathname } = req.nextUrl
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "unknown"

      // Rate limiting nas rotas sensíveis
      if (!checkRateLimit(ip, pathname)) {
        return NextResponse.json(
          { error: "Demasiados pedidos. Tenta novamente em 60 segundos." },
          { status: 429 }
        )
      }

      const publicRoutes = ["/login", "/api/auth", "/api/webhooks"]
      if (publicRoutes.some((r) => pathname.startsWith(r))) {
        const res = NextResponse.next()
        res.headers.set("x-pathname", pathname)
        return res
      }
      if (!req.auth) {
        return NextResponse.redirect(new URL("/login", req.nextUrl))
      }
      if (pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
      }
      const res = NextResponse.next()
      res.headers.set("x-pathname", pathname)
      return res
    })

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
