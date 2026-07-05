"use client"

import type { Route } from "next"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const AUTHED_ITEMS: { href: Route; label: string }[] = [
  { href: "/journal", label: "Journal" },
  { href: "/explore", label: "Explore" },
  { href: "/brews/new", label: "New Brew" },
  { href: "/settings", label: "Settings" },
]

const GUEST_ITEMS: { href: Route; label: string }[] = [
  { href: "/explore", label: "Explore" },
  { href: "/login", label: "Sign in" },
  { href: "/signup", label: "Sign up" },
]

function navLinkClass(active: boolean) {
  return cn(
    "text-foreground transition-colors hover:text-foreground/40",
    active && "underline underline-offset-4",
  )
}

function BottomNav({ authed }: { authed: boolean }) {
  const pathname = usePathname()
  const items = authed ? AUTHED_ITEMS : GUEST_ITEMS

  return (
    <nav className="border-border bg-background fixed inset-x-0 bottom-0 z-50 border-t md:hidden">
      <div className="flex h-12 items-stretch pb-[env(safe-area-inset-bottom)]">
        {items.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-small flex flex-1 items-center justify-center",
              i > 0 && "border-border border-l",
              navLinkClass(pathname.startsWith(item.href)),
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

function DesktopNav({ authed }: { authed: boolean }) {
  const pathname = usePathname()
  const items = authed ? AUTHED_ITEMS : GUEST_ITEMS

  return (
    <nav className="text-body hidden items-center gap-8 md:flex">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={navLinkClass(pathname.startsWith(item.href))}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export { BottomNav, DesktopNav }
