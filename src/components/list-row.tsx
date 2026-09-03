import type { Route } from "next"
import type { ReactNode } from "react"

import Link from "next/link"

import { formatDate } from "@/lib/format"
import { getLocale } from "@/lib/i18n"

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
 * right-aligned on md.
 *
 * The date is the list's ordering principle, so it ships at every width. It
 * used to be `hidden md:block`, which left the phone — the product's primary
 * usage context, at the brewing station — with a journal that never said when
 * anything was brewed. Below md it leads the row as a small gray line instead
 * of taking a column of its own.
 */
export async function ListRow<T extends string>({
  href,
  title,
  subtitle,
  date,
  children,
}: ListRowProps<T>) {
  const locale = await getLocale()

  return (
    <Link
      href={href}
      className="group border-border grid grid-cols-1 gap-x-3 gap-y-1 border-b py-4 md:grid-cols-12 md:items-baseline md:gap-x-5 md:gap-y-0"
    >
      <p className="text-small text-muted-foreground md:hidden">
        {formatDate(date, locale)}
      </p>
      <p className="text-h3 font-medium wrap-anywhere group-hover:underline group-hover:underline-offset-4 md:col-span-4">
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
        {formatDate(date, locale)}
      </p>
    </Link>
  )
}
