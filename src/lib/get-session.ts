import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const DEV_USER_ID = "dev-preview"

const DEV_SESSION = {
  user: {
    id: DEV_USER_ID,
    name: "Dev Preview",
    email: "dev@pawreach.local",
    image: null as string | null,
  },
  expires: new Date(Date.now() + 86400000).toISOString(),
}

let devUserEnsured = false

async function ensureDevUser() {
  if (devUserEnsured) return
  await prisma.user.upsert({
    where: { id: DEV_USER_ID },
    create: { id: DEV_USER_ID, email: "dev@pawreach.local", name: "Dev Preview" },
    update: {},
  })
  devUserEnsured = true
}

export async function getSession() {
  if (process.env.DEV_PREVIEW === "true" && process.env.NODE_ENV !== "production") {
    await ensureDevUser()
    return DEV_SESSION
  }
  return auth()
}
