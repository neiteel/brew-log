"use client"

import { TextButton } from "@/components/text-button"

// Navigates to the export route; Content-Disposition makes the browser
// download the file instead of leaving the page.
function ExportButton() {
  return (
    <TextButton
      type="button"
      onClick={() => window.location.assign("/api/export")}
      className="font-normal"
    >
      Export data (JSON)
    </TextButton>
  )
}

export { ExportButton }
