"use client"

import { useEffect, useSyncExternalStore } from "react"
import Link from "next/link"

import { PageHeader } from "@/components/page-header"
import { SiteHeader } from "@/components/site-header"
import { TextButton } from "@/components/text-button"
import { DEFAULT_LOCALE, toLocale } from "@/lib/i18n/config"

// The last stop for anything thrown while rendering — a dropped database
// connection, a failed query, a bug. Without it a viewer gets the framework's
// own error screen, which belongs to no design system and offers no way back.
//
// The one surface with no server parent to hand it a dictionary: an error
// boundary must be a Client Component, and it only receives `error` and
// `retry`. So it reads the locale the root layout already published on
// `<html lang>`, and carries its own five strings — importing the dictionaries
// here would ship both of them to every route, since this boundary wraps them
// all.
const MESSAGES = {
  en: {
    title: "Something went wrong",
    body: "The page didn’t finish loading. This is usually temporary — try again, and nothing you saved is affected.",
    tryAgain: "Try again",
    journal: "Back to your journal",
    reference: "Reference",
  },
  "zh-Hant": {
    title: "出了點狀況",
    body: "這個頁面沒有載入完成。通常是暫時的——再試一次，你存過的資料不受影響。",
    tryAgain: "再試一次",
    journal: "回到你的日誌",
    reference: "參考編號",
  },
}

// `<html lang>` only exists on the client. useSyncExternalStore is how React
// reads a client-only value without a hydration mismatch: the server snapshot
// renders first, then it swaps to the real one. `lang` never changes after
// load, so there is nothing to subscribe to.
const subscribe = () => () => {}

function useDocumentLocale() {
  return toLocale(
    useSyncExternalStore(
      subscribe,
      () => document.documentElement.lang,
      () => DEFAULT_LOCALE,
    ),
  )
}

export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  const t = MESSAGES[useDocumentLocale()]

  useEffect(() => {
    console.error("[app] uncaught render error", error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-375 flex-col px-3 md:px-5">
      <SiteHeader />
      <main className="flex-1 pt-14 pb-32 md:pt-24">
        <div className="max-w-prose space-y-10">
          <PageHeader title={t.title} subtitle={t.body} />
          <div className="text-body flex flex-wrap items-center gap-x-8 gap-y-3">
            <TextButton type="button" onClick={() => retry()}>
              {t.tryAgain}
            </TextButton>
            <Link
              href="/journal"
              className="text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              {t.journal}
            </Link>
          </div>
          {/* The one thing that makes a report actionable in production. */}
          {error.digest ? (
            <p className="text-small text-muted-foreground">
              {t.reference} {error.digest}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  )
}
