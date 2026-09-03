"use client"

import type { Messages } from "@/lib/i18n"

import { useState } from "react"

import { createBean } from "../actions"
import { BeanForm } from "../bean-form"
import { type BeanScanFields, type ScanQuota } from "../scan"
import { BeanScanner } from "./bean-scanner"

// Client shell for the "new bean" page: the scanner lifts extracted fields up
// here, and each new scan bumps `version` so the (uncontrolled) BeanForm
// remounts and re-seeds its defaultValues from the latest prefill.
function NewBean({
  quota,
  formLabels,
  enums,
  ai,
}: {
  quota: ScanQuota
  formLabels: Messages["form"]
  enums: Messages["enums"]
  ai: Messages["ai"]
}) {
  const [prefill, setPrefill] = useState<BeanScanFields | null>(null)
  const [version, setVersion] = useState(0)

  return (
    <div className="space-y-10 md:space-y-12">
      <BeanScanner
        initialRemaining={quota.remaining}
        limit={quota.limit}
        t={ai}
        onScanned={(fields) => {
          setPrefill(fields)
          setVersion((v) => v + 1)
        }}
      />
      <BeanForm
        key={version}
        action={createBean}
        prefill={prefill}
        cancelHref="/journal"
        t={formLabels}
        enums={enums}
      />
    </div>
  )
}

export { NewBean }
