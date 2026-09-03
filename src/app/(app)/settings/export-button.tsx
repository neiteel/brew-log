"use client"

import type { Messages } from "@/lib/i18n"

import { TextButton } from "@/components/text-button"

// Navigates to the export route; Content-Disposition makes the browser
// download the file instead of leaving the page.
function ExportButton({ t }: { t: Messages["settings"] }) {
  return (
    <TextButton
      type="button"
      onClick={() => window.location.assign("/api/export")}
      className="font-normal"
    >
      {t.exportData}
    </TextButton>
  )
}

export { ExportButton }
