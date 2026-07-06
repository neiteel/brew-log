"use client"

import { useState } from "react"

import { askBrewMaster } from "../advice"

type Status = "idle" | "working" | "error"

function BrewMaster({
  brewId,
  ready,
  initialAdvice,
  initialRemaining,
  limit,
}: {
  brewId: string
  ready: boolean
  initialAdvice: string | null
  initialRemaining: number
  limit: number
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
      setError("Something went wrong. Please try again.")
    }
  }

  if (!ready) {
    return (
      <p className="text-small text-muted-foreground border-border border border-dashed p-5 md:p-6">
        Add an overall rating and score all five taste dimensions to ask the
        Brew Master for tuning advice on your next cup.
      </p>
    )
  }

  return (
    <div className="border-border space-y-4 border border-dashed p-5 md:p-6">
      {advice ? (
        <p className="text-body text-foreground whitespace-pre-wrap">
          {advice}
        </p>
      ) : (
        <p className="text-small text-muted-foreground">
          Get tailored suggestions for your next brew of this coffee, based on
          this cup, the roaster’s flavor notes, and your brew history.
        </p>
      )}

      <div className="text-body flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={() => run(advice != null)}
          disabled={working || depleted}
          className="border-foreground text-foreground hover:bg-foreground hover:text-background disabled:text-muted-foreground disabled:border-border border px-4 py-2 font-medium transition-colors disabled:hover:bg-transparent"
        >
          {working
            ? "Thinking…"
            : advice
              ? "Regenerate"
              : "Ask the Brew Master"}
        </button>
        <span className="text-small text-muted-foreground">
          {working
            ? "This can take a few seconds."
            : depleted
              ? "Monthly limit reached — resets next month."
              : `${remaining} of ${limit} left this month`}
        </span>
      </div>

      {status === "error" && error ? (
        <p className="text-small text-destructive">{error}</p>
      ) : null}
    </div>
  )
}

export { BrewMaster }
