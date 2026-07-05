import type { Route } from "next"
import type { ReactNode } from "react"

import Link from "next/link"

import { formatDate } from "@/lib/format"

type ListRowProps<T extends string> = {
  href: Route<T>
  title: ReactNode
  subtitle?: ReactNode
  date: Date
  /** Middle cells, sized with `md:col-span-*` (should total 6 on md). */
  children?: ReactNode
}

/**
 * A single row in a journal-style list: title (with optional em-dash
 * subtitle) first, caller-supplied middle content next, and the date last —
 * right-aligned on md and hidden on small screens.
 */
export function ListRow<T extends string>({
  href,
  title,
  subtitle,
  date,
  children,
}: ListRowProps<T>) {
  return (
    <Link
      href={href}
      className="group border-border grid grid-cols-1 gap-x-3 gap-y-1 border-b py-4 md:grid-cols-12 md:items-baseline md:gap-x-5 md:gap-y-0"
    >
      <p className="text-h3 font-medium group-hover:underline group-hover:underline-offset-4 md:col-span-4">
        {title}
        {subtitle != null ? (
          <>
            {" "}
            <span className="text-muted-foreground font-normal">
              — {subtitle}
            </span>
          </>
        ) : null}
      </p>
      {children}
      <p className="text-small text-muted-foreground hidden md:col-span-2 md:block md:text-right">
        {formatDate(date)}
      </p>
    </Link>
  )
}
