# Phase 12 — Email 驗證（Email Verification + 安全帳號連結）

2026-07-06 完成。修 Phase 11 實測到的 `account_not_linked`（同 email 先密碼註冊、再 Google 登入被擋）。`auth.ts` 加 `emailVerification`（`sendOnSignUp` + `autoSignInAfterVerification` + Resend 寄 `verify-email.ts`），並把 accountLinking 的 `requireLocalEmailVerified` 從 Phase 11 臨時的 `false` 改回安全預設（擋帳號預劫持）。不開 `requireEmailVerification`（不擋登入，避免鎖死 dev 帳號與現有未驗證帳號）。signup 傳 `callbackURL=/journal`；`signIn.social` 加 `errorCallbackURL=/login`，登入頁讀 `?error=` 顯示友善訊息（`account_not_linked` → 引導用密碼登入、驗證後再用 Google）。`pnpm build` 通過。
