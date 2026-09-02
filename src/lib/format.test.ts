/**
 * Runnable check for the two hardening rules that are easy to regress:
 * `externalHref` must never hand a non-http(s) scheme to an `href`, and the
 * bean form must reject the same values before they are stored.
 *
 *   pnpm exec tsx src/lib/format.test.ts
 */
import assert from "node:assert/strict"

import { z } from "zod"

import { externalHref } from "./format"

// Mirrors the productUrl rule in src/app/(app)/beans/actions.ts.
const productUrl = z.url({ protocol: /^https?$/ }).max(2000)

const unsafe = [
  "javascript:alert(1)",
  "JavaScript:alert(1)",
  "data:text/html,<script>alert(1)</script>",
  "vbscript:msgbox(1)",
  "  javascript:alert(1)",
  "ftp://example.com/beans",
]
const safe = ["https://example.com/beans", "http://example.com/beans?lot=12"]

for (const url of unsafe) {
  assert.equal(externalHref(url), null, `externalHref allowed ${url}`)
  assert.equal(
    productUrl.safeParse(url).success,
    false,
    `schema allowed ${url}`,
  )
}
for (const url of safe) {
  assert.equal(externalHref(url), url, `externalHref rejected ${url}`)
  assert.equal(
    productUrl.safeParse(url).success,
    true,
    `schema rejected ${url}`,
  )
}
assert.equal(externalHref(null), null)
assert.equal(externalHref(""), null)

// Length caps: unbounded `text` columns mean the schema is the only ceiling.
const capped = z.string().trim().max(300)
assert.equal(capped.safeParse("x".repeat(301)).success, false)
assert.equal(capped.safeParse("x".repeat(300)).success, true)

console.log("format checks passed")
