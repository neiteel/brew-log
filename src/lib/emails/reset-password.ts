/**
 * Password-reset email content. Kept as inline HTML (no external assets) so it
 * renders reliably across mail clients. Styling mirrors the app's editorial,
 * type-forward look without depending on the site's CSS.
 */
export function resetPasswordEmail({ url }: { url: string }) {
  const subject = "Reset your password"

  const text = [
    "Reset your password",
    "",
    "We received a request to reset the password for your Brew.log account.",
    "Open the link below to choose a new one. It expires in 1 hour.",
    "",
    url,
    "",
    "If you didn't request this, you can safely ignore this email — your password won't change.",
  ].join("\n")

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f4f2;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f2;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e6e3df;border-radius:12px;padding:40px;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
            <tr>
              <td>
                <p style="margin:0 0 24px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#8a8580;font-family:Helvetica,Arial,sans-serif;">Brew.log</p>
                <h1 style="margin:0 0 20px;font-size:26px;font-weight:500;line-height:1.2;">Reset your password</h1>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#3a3a3a;">We received a request to reset the password for your account. Choose a new one below.</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                  <tr>
                    <td style="border-radius:8px;background:#1a1a1a;">
                      <a href="${url}" style="display:inline-block;padding:14px 28px;font-size:15px;font-family:Helvetica,Arial,sans-serif;color:#ffffff;text-decoration:none;border-radius:8px;">Reset password</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#8a8580;">This link expires in 1 hour.</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#8a8580;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  return { subject, html, text }
}
