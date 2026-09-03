"use client"

import type { Messages } from "@/lib/i18n"

import { useState } from "react"

import { Button } from "@/components/button"
import { TextButton } from "@/components/text-button"
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
  // The quota is spent whether or not an answer is already cached, so a zero
  // balance disables the control either way. Gating this on `!advice` left
  // "Regenerate" enabled beside "0 of 5 left this month", where the only
  // possible outcome was a server refusal.
  const depleted = remaining <= 0

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
        // Demoted to annotation gray while a replacement is generating: the
        // text on screen is about to stop being the answer, and leaving it at
        // full ink presents last month's advice as this request's result.
        <p
          className={`text-body wrap-anywhere whitespace-pre-wrap ${
            working ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          {advice}
        </p>
      ) : (
        <p className="text-small text-muted-foreground">{t.intro}</p>
      )}

      <div className="text-body flex flex-wrap items-center gap-x-4 gap-y-2">
        {advice ? (
          // Regenerating replaces an answer rather than writing a new one, so
          // it is not a commit action and does not get the primary button.
          <TextButton
            type="button"
            onClick={() => {
              if (window.confirm(t.regenerateConfirm)) run(true)
            }}
            disabled={working || depleted}
            aria-busy={working}
          >
            {working ? t.thinking : t.regenerate}
          </TextButton>
        ) : (
          <Button
            type="button"
            onClick={() => run(false)}
            disabled={working || depleted}
            aria-busy={working}
          >
            {working ? t.thinking : t.ask}
          </Button>
        )}
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
