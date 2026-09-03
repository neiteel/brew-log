import Link from "next/link"

import { PageHeader } from "@/components/page-header"
import { SiteHeader } from "@/components/site-header"
import { getDictionary } from "@/lib/i18n"
import { getSession } from "@/lib/session"

export async function generateMetadata() {
  const { titles } = await getDictionary()
  return { title: titles.notFound }
}

// Catches both unmatched URLs and every `notFound()` thrown in the app — a
// deleted brew, a bean that belongs to someone else, a username that no longer
// exists. It renders outside the app layout, so it carries its own shell and
// its own way back in.
export default async function NotFound() {
  const session = await getSession()
  const dict = await getDictionary()

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-375 flex-col px-3 md:px-5">
      <SiteHeader />
      <main className="flex-1 pt-14 pb-32 md:pt-24">
        <div className="max-w-prose space-y-10">
          <PageHeader
            title={dict.notFound.title}
            subtitle={dict.notFound.body}
          />
          <div className="text-body flex flex-wrap items-center gap-x-8 gap-y-3">
            {session ? (
              <Link
                href="/journal"
                className="hover:text-muted-foreground font-medium underline underline-offset-4"
              >
                {dict.notFound.journal}
              </Link>
            ) : null}
            <Link
              href="/explore"
              className="text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              {dict.notFound.explore}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
