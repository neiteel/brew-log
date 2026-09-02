"use client"

import { useEffect } from "react"
import Link from "next/link"

import { PageHeader } from "@/components/page-header"
import { SiteHeader } from "@/components/site-header"
import { TextButton } from "@/components/text-button"

// The last stop for anything thrown while rendering — a dropped database
// connection, a failed query, a bug. Without it a viewer gets the framework's
// own error screen, which belongs to no design system and offers no way back.
//
// English only for now: error boundaries are client components, so there is no
// server parent to hand this one the viewer's dictionary. Feature 17 owns that.
export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error("[app] uncaught render error", error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-375 flex-col px-3 md:px-5">
      <SiteHeader />
      <main className="flex-1 pt-14 pb-32 md:pt-24">
        <div className="max-w-prose space-y-10">
          <PageHeader
            title="Something went wrong"
            subtitle="The page didn’t finish loading. This is usually temporary — try again, and nothing you saved is affected."
          />
          <div className="text-body flex flex-wrap items-center gap-x-8 gap-y-3">
            <TextButton type="button" onClick={() => unstable_retry()}>
              Try again
            </TextButton>
            <Link
              href="/journal"
              className="text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Back to your journal
            </Link>
          </div>
          {/* The one thing that makes a report actionable in production. */}
          {error.digest ? (
            <p className="text-small text-muted-foreground">
              Reference {error.digest}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  )
}
