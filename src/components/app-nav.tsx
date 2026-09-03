"use client"

import type { Messages } from "@/lib/i18n"
import type { Route } from "next"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

type Nav = Messages["nav"]

// Routes stay here; only the labels come in, as the one dictionary slice these
// two components need.
function navItems(nav: Nav, authed: boolean): { href: Route; label: string }[] {
  return authed
    ? [
        { href: "/journal", label: nav.journal },
        { href: "/explore", label: nav.explore },
        { href: "/brews/new", label: nav.newBrew },
        { href: "/settings", label: nav.settings },
      ]
    : [
        { href: "/explore", label: nav.explore },
        { href: "/login", label: nav.signIn },
        { href: "/signup", label: nav.signUp },
      ]
}

function navLinkClass(active: boolean) {
  return cn(
    "text-foreground hover:text-muted-foreground transition-colors",
    active && "underline underline-offset-4",
  )
}

function BottomNav({ authed, nav }: { authed: boolean; nav: Nav }) {
  const pathname = usePathname()
  const items = navItems(nav, authed)

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

function DesktopNav({ authed, nav }: { authed: boolean; nav: Nav }) {
  const pathname = usePathname()
  const items = navItems(nav, authed)

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
