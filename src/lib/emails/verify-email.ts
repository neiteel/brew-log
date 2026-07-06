/**
 * Email-verification email content. Same inline-HTML, editorial styling as the
 * password-reset email so the two transactional emails feel like one brand.
 */
export function verifyEmail({ url }: { url: string }) {
  const subject = "Verify your email address"

  const text = [
    "Verify your email address",
    "",
    "Confirm this is your email to finish setting up your Brew.log account.",
    "It also lets you sign in with Google later using this address.",
    "",
    url,
    "",
    "If you didn't create a Brew.log account, you can safely ignore this email.",
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
                <h1 style="margin:0 0 20px;font-size:26px;font-weight:500;line-height:1.2;">Verify your email</h1>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#3a3a3a;">Confirm this is your email to finish setting up your account. It also lets you sign in with Google later using this address.</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                  <tr>
                    <td style="border-radius:8px;background:#1a1a1a;">
                      <a href="${url}" style="display:inline-block;padding:14px 28px;font-size:15px;font-family:Helvetica,Arial,sans-serif;color:#ffffff;text-decoration:none;border-radius:8px;">Verify email</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#8a8580;">If you didn't create a Brew.log account, you can safely ignore this email.</p>
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
