"use client"

import type { Messages } from "@/lib/i18n"

import { useState } from "react"

import { Button } from "@/components/button"
import { fill } from "@/lib/i18n/config"

import { askBrewMaster } from "../advice"

type Status = "idle" | "working" | "error"

function BrewMaster({
  brewId,
  ready,
  initialAdvice,
  initialRemaining,
  limit,
  t,
}: {
  brewId: string
  ready: boolean
  initialAdvice: string | null
  initialRemaining: number
  limit: number
  t: Messages["brewMaster"]
}) {
  const [advice, setAdvice] = useState<string | null>(initialAdvice)
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState(initialRemaining)

  const working = status === "working"
  const depleted = remaining <= 0 && !advice

  async function run(force: boolean) {
    setStatus("working")
    setError(null)
    try {
      const result = await askBrewMaster(brewId, { force })
      setRemaining(result.remaining)
      if (!result.ok) {
        setStatus("error")
        setError(result.error)
        return
      }
      setStatus("idle")
      setAdvice(result.advice)
    } catch (err) {
      console.error("[BrewMaster] request failed", err)
      setStatus("error")
      setError(t.failed)
    }
  }

  if (!ready) {
    return (
      <p className="text-small text-muted-foreground border-border border border-dashed p-5 md:p-6">
        {t.notReady}
      </p>
    )
  }

  return (
    <div className="border-border space-y-4 border border-dashed p-5 md:p-6">
      {advice ? (
        <p
          role="status"
          className="text-body text-foreground wrap-anywhere whitespace-pre-wrap"
        >
          {advice}
        </p>
      ) : (
        <p className="text-small text-muted-foreground">{t.intro}</p>
      )}

      <div className="text-body flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button
          type="button"
          onClick={() => run(advice != null)}
          disabled={working || depleted}
          aria-busy={working}
        >
          {working ? t.thinking : advice ? t.regenerate : t.ask}
        </Button>
        <span role="status" className="text-small text-muted-foreground">
          {working
            ? t.takesSeconds
            : depleted
              ? t.depleted
              : fill(t.remaining, { remaining, limit })}
        </span>
      </div>

      {status === "error" && error ? (
        <p role="alert" className="text-small text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { BrewMaster }
