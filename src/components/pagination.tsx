import Link from "next/link"

export const PAGE_SIZE = 10

// Parse a ?page= style param and clamp it to the valid range, so hand-edited
// or stale URLs collapse to a real page instead of an empty list.
export function clampPage(
  raw: string | string[] | undefined,
  totalCount: number,
) {
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const parsed = typeof raw === "string" ? Number.parseInt(raw, 10) : NaN
  const page = Number.isNaN(parsed)
    ? 1
    : Math.min(Math.max(1, parsed), totalPages)
  return { page, totalPages, offset: (page - 1) * PAGE_SIZE }
}

// Prev / Next links plus a "Page X of Y" counter. `params` carries the other
// search params (filters, the sibling list's page) so navigation preserves
// them; the page param is dropped entirely on page 1 to keep URLs clean.
// `scroll={false}` keeps the scroll position — for lists partway down a page,
// where jumping back to the top would lose the reader's place.
function Pagination({
  pathname,
  page,
  totalPages,
  paramName = "page",
  params = {},
  scroll = true,
}: {
  pathname: string
  page: number
  totalPages: number
  paramName?: string
  params?: Record<string, string | undefined>
  scroll?: boolean
}) {
  if (totalPages <= 1) return null

  const href = (target: number) => {
    const query: Record<string, string> = {}
    for (const [key, value] of Object.entries(params))
      if (value) query[key] = value
    if (target > 1) query[paramName] = String(target)
    return { pathname, query }
  }

  return (
    <nav className="text-body flex items-center gap-8">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          scroll={scroll}
          className="hover:text-muted-foreground font-medium underline underline-offset-4"
        >
          Previous
        </Link>
      ) : null}
      <span className="text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={href(page + 1)}
          scroll={scroll}
          className="hover:text-muted-foreground font-medium underline underline-offset-4"
        >
          Next
        </Link>
      ) : null}
    </nav>
  )
}

export { Pagination }
