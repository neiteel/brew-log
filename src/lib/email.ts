import { Resend } from "resend"

const apiKey = process.env.RESEND_API_KEY
const from = process.env.EMAIL_FROM ?? "Brew.log <onboarding@resend.dev>"

const resend = apiKey ? new Resend(apiKey) : null

type SendEmailArgs = {
  to: string
  subject: string
  html: string
  text: string
  /** Prevents duplicate sends on retry. Format: `<event-type>/<entity-id>`. */
  idempotencyKey?: string
}

/**
 * Sends a transactional email via Resend.
 *
 * When `RESEND_API_KEY` is absent (local dev without a key), the message is
 * logged to the server console instead so flows like password reset stay
 * testable — the reset link is printed for you to click.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  idempotencyKey,
}: SendEmailArgs) {
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY not set — email not sent.\n` +
        `  to: ${to}\n  subject: ${subject}\n  body:\n${text}`,
    )
    return
  }

  // The Resend SDK never throws — it returns { data, error }.
  const { error } = await resend.emails.send(
    { from, to, subject, html, text },
    idempotencyKey ? { idempotencyKey } : undefined,
  )

  if (error) {
    console.error(
      `[email] failed to send "${subject}" to ${to}:`,
      error.message,
    )
  }
}
