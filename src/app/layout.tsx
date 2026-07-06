import type { Metadata } from "next"

import { Inter_Tight } from "next/font/google"

import "./globals.css"

import { cn } from "@/lib/utils"

const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: {
    default: "Brew.log",
    template: "%s — Brew.log",
  },
  description:
    "A coffee brewing journal — beans, recipes and tasting notes, shared or private.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn("antialiased", "font-sans", interTight.variable)}
    >
      <body>{children}</body>
    </html>
  )
}
