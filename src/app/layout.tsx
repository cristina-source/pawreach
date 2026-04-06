import type { Metadata } from "next"
import "./globals.css"
import { Inter, Syne } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const syne = Syne({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-syne" })

export const metadata: Metadata = {
  title: "PawReach — Email Marketing para o Mercado Pet",
  description:
    "Plataforma de email marketing especializada para pet shops, grooming, clínicas veterinárias e hotéis para animais.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt" className={`${inter.variable} ${syne.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("pawreach-theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
