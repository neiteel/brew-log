"use client"

import type { BeanScanFields } from "../scan"

import { useRef, useState } from "react"

import { cn } from "@/lib/utils"

import { scanBeanPhoto } from "../scan"

// Longest edge we downscale a bag photo to before uploading. Keeps the image
// well within Gemini's ~1,568px tiling grid so we pay for ~1–1.6k image tokens
// per scan instead of shipping a full-resolution phone photo.
const MAX_EDGE = 1568
const JPEG_QUALITY = 0.8

type Status = "idle" | "working" | "error"

// Downscale + re-encode the picked photo to a JPEG entirely on the client, so
// the raw multi-megabyte camera file never leaves the device.
async function compressImage(
  file: File,
): Promise<{ image: string; mediaType: string }> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  })
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas not supported")
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY)
  return { image: dataUrl.split(",")[1], mediaType: "image/jpeg" }
}

function BeanScanner({
  onScanned,
  initialRemaining,
  limit,
}: {
  onScanned: (fields: BeanScanFields) => void
  initialRemaining: number
  limit: number
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState(initialRemaining)
  const [dragging, setDragging] = useState(false)

  const working = status === "working"
  const depleted = remaining <= 0
  const disabled = working || depleted

  async function processFile(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setStatus("error")
      setError("That's not an image. Upload a photo of the coffee bag.")
      return
    }

    setStatus("working")
    setError(null)
    try {
      const { image, mediaType } = await compressImage(file)
      const result = await scanBeanPhoto({ image, mediaType })
      setRemaining(result.remaining)
      if (!result.ok) {
        setStatus("error")
        setError(result.error)
        return
      }
      setStatus("idle")
      onScanned(result.fields)
    } catch (err) {
      console.error("[BeanScanner] scan failed", err)
      setStatus("error")
      setError("Something went wrong reading that photo. Please try again.")
    }
  }

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset so re-picking the same file fires onChange again.
    event.target.value = ""
    void processFile(file)
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault()
    setDragging(false)
    if (disabled) return
    void processFile(event.dataTransfer.files?.[0])
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "space-y-3 border border-dashed p-5 transition-colors md:p-6",
        dragging ? "border-foreground bg-muted/40" : "border-border",
      )}
    >
      <div className="space-y-1">
        <p className="text-body text-foreground font-medium">
          Scan a bag photo
        </p>
        <p className="text-small text-muted-foreground">
          Upload, drag in, or snap a photo of the coffee bag and AI will
          pre-fill the fields below. Check everything before saving — the photo
          isn’t stored.
        </p>
      </div>

      <div className="text-body flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="border-foreground text-foreground hover:bg-foreground hover:text-background disabled:text-muted-foreground disabled:border-border border px-4 py-2 font-medium transition-colors disabled:hover:bg-transparent"
        >
          {working ? "Reading photo…" : "Scan bag photo"}
        </button>
        <span className="text-small text-muted-foreground">
          {working
            ? "This can take a few seconds."
            : `${remaining} of ${limit} scans left this month`}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInput}
        className="hidden"
      />

      {status === "error" && error ? (
        <p className="text-small text-destructive">{error}</p>
      ) : null}
    </div>
  )
}

export { BeanScanner }
