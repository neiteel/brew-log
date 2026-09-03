import type { Metadata } from "next"

import { Inter_Tight } from "next/font/google"

import "./globals.css"

import { getLocale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
})

export const metadata: Metadata = {
  title: {
    default: "Brew.log",
    template: "%s — Brew.log",
  },
  description:
    "A coffee brewing journal — beans, recipes and tasting notes, shared or private.",
}

// `lang` follows the viewer's locale, so a screen reader reads zh-Hant in
// Chinese instead of voicing it with English phonetics, and the browser picks
// the right font and line-breaking rules for the script. It is also the only
// way `app/error.tsx` — a client component with no server parent — learns which
// language to render in.
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang={await getLocale()}
      className={cn("antialiased", "font-sans", interTight.variable)}
    >
      <body>{children}</body>
    </html>
  )
}
