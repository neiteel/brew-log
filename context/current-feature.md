# Current Feature: Phase 12 — Email 驗證（Email Verification + 安全帳號連結）

## Status

Completed (2026-07-06)

## 起因

Phase 11 做完後實測「先 email 註冊 → 再用同 email Google 登入」噴 `account_not_linked`。根因：Better Auth 連結到已存在帳號時，除了 `trustedProviders`（放行 provider 端）外，還要求**本地帳號 `emailVerified=true`**（`accountLinking.requireLocalEmailVerified` 預設 true）；本專案原本沒有 email 驗證，所有 email/密碼使用者都是未驗證，故必噴錯。

一度用 `requireLocalEmailVerified: false` 繞過，但那會開**帳號預劫持（pre-hijacking）**漏洞：攻擊者先用你的 email＋他的密碼註冊（未驗證），你之後 Google 登入 → 合併 → 攻擊者密碼仍在。故改為正解：加 email 驗證。

## Goals（採「不擋登入」）

- `auth.ts` 加 `emailVerification`：`sendOnSignUp: true`（註冊自動寄驗證信）、`autoSignInAfterVerification: true`（點連結後自動登入）、`sendVerificationEmail` 透過 Resend 寄 `src/lib/emails/verify-email.ts`。
- **不開** `emailAndPassword.requireEmailVerification`（未驗證仍可登入用 app；驗證只設 `emailVerified` 旗標、解鎖 Google 連結）。理由：dev 登入帳號（假信箱收不到信）＋現有未驗證帳號不被鎖死。
- `requireLocalEmailVerified` **改回安全預設**（移除 Phase 11 臨時加的 `false`）。
- 驗證信連結：Better Auth 走 `/api/auth/verify-email?token=…&callbackURL=…`，驗完導回 callbackURL。signup 傳 `callbackURL: origin+"/journal"`。
- **把 `account_not_linked` 變友善**：`signIn.social` 加 `errorCallbackURL: origin+"/login"`；登入頁（server component 讀 `searchParams.error`）對應訊息「這 email 已有密碼，請用密碼登入；驗證 email 後即可用 Google」。

## 待辦提醒（未做）

- **Google 登入正式上線前**：GCP 補 production redirect URI；Vercel 設 `GOOGLE_CLIENT_ID/SECRET`、`BETTER_AUTH_URL`、`RESEND_API_KEY`。
- **寄件網域**：目前 `onboarding@resend.dev` 只能寄到 Resend 帳號信箱（neiteel@gmail.com）。要真正寄給任何使用者（驗證信／重設信）必須先在 Resend 驗證自有網域並改 `EMAIL_FROM`。
- （已做）Settings 加了「未驗證提示 + 重寄驗證信」：Email row 顯示 Verified/Not verified；未驗證時顯示 `ResendVerification`（client，`authClient.sendVerificationEmail({ email, callbackURL: origin+"/journal" })`）。最佳實踐＝自動寄（主）＋重寄鈕（安全網）並存。

## Notes

### Better Auth 背景知識（2026-07-06 討論）

- user 與登入方式分離：一個 `user` 可掛多個 `account`。Google 註冊者只有 `providerId: "google"` 的 account，**沒有 credential account**，用 `signIn.email` 會得到通用的 `INVALID_EMAIL_OR_PASSWORD`（刻意不透露帳號存在）。
- OAuth 使用者補密碼兩條路：(1) 走忘記密碼流程（官方推薦，reset 時自動建 credential account）＝本 feature；(2) server-only `auth.api.setPassword`（可做在帳號設定頁）。
- Account linking：email+密碼使用者之後用同 email 的 Google 登入，設定 `account.accountLinking: { enabled: true, trustedProviders: ["google"] }` 即可連到同一 user。

### 後續路線圖（2026-07-06 討論）

- **梯隊 1（auth）✅ 全部完成**：① 忘記密碼 Phase 9 → ③ 修改密碼 Phase 10 → ② Google 登入 Phase 11（含 Settings 密碼區條件式 Change/Set password，已解決先前的 ⚠️ 相依）。
- **梯隊 2**：
  - **i18n 繁中**：實作前先讀 `node_modules/next/dist/docs/` 的 i18n 指南，不可直接套 next-intl 常規做法。
  - **列表分頁**：目前 journal、beans、explore 是一次全撈（首頁有 `.limit(6)`），資料多會變慢；建議 cursor 或 page 分頁，每頁 20–30 筆。
  - **資料上限**：beans / brews 目前無筆數限制（僅 AI 功能各 10 次/月）；若要防濫用設寬鬆上限即可（如每人 200 顆豆、2000 筆沖煮），屬產品決定。
  - **Explore 回饋**：決定**只做讚、不做倒讚**（個人沖煮紀錄的分享場景，倒讚是負激勵；倒讚的排序用途此處不需要）。實作：`brew_likes` 表（`userId` + `brewId` 唯一鍵）＋ explore 卡片與詳情頁按鈕。更遠期比倒讚更好的回饋是「我也試了這個配方」或簡短留言。

## History

- **Phase 12b — Google 使用者 username 補齊** — 2026-07-06。實測發現 Google 註冊者沒有 username → 公開頁 `/u/[username]` 失效。`auth.ts` 加 `databaseHooks.user.create.before`：建立時若無 username，就從 email local-part 產生合法且唯一的 username（`generateUniqueUsername`，符合 3–30 字、`[a-z0-9_.]`，衝突加隨機尾碼），同時填 `displayUsername`。使用者仍可在 Settings 改。**注意**：此 hook 只對「之後新建」的使用者生效；先前已建立的 Google 帳號（username 為 null）需自行到 Settings 設一個。

- **Phase 12 — Email 驗證（Email Verification + 安全帳號連結）** — 2026-07-06 完成。修 Phase 11 實測到的 `account_not_linked`（同 email 先密碼註冊、再 Google 登入被擋）。`auth.ts` 加 `emailVerification`（`sendOnSignUp` + `autoSignInAfterVerification` + Resend 寄 `verify-email.ts`），並把 accountLinking 的 `requireLocalEmailVerified` 從 Phase 11 臨時的 `false` 改回安全預設（擋帳號預劫持）。不開 `requireEmailVerification`（不擋登入，避免鎖死 dev 帳號與現有未驗證帳號）。signup 傳 `callbackURL=/journal`；`signIn.social` 加 `errorCallbackURL=/login`，登入頁讀 `?error=` 顯示友善訊息（`account_not_linked` → 引導用密碼登入、驗證後再用 Google）。`pnpm build` 通過。

- **Phase 11 — Google 登入（Social Sign-in + Account Linking）** — 2026-07-06 完成。`auth.ts` 加 `socialProviders.google`（clientId/secret 走 env）與 `account.accountLinking: { enabled: true, trustedProviders: ["google"] }`。新增共用 `src/components/social-auth.tsx`（「or」分隔線＋帶 Google G logo 的「Continue with Google」按鈕，`authClient.signIn.social({ provider: "google", callbackURL: "/journal" })`），放進登入頁與註冊頁。**連帶改 Settings 密碼區為條件式**：settings（server component）用 `auth.api.listUserAccounts` 查有無 `providerId:"credential"`——有→`ChangePasswordForm`；沒有（Google-only）→新增 `SetPasswordForm`（呼叫 `set-password-action.ts` 這個 server action → server-only `auth.api.setPassword({ body:{ newPassword } })`，成功即建立 credential account，`router.refresh()` 後改顯示 Change 表單）。`account` 表既有 OAuth 欄位（accessToken/idToken 等），免 migration。GCP redirect URI 需含 `http://localhost:3000/api/auth/callback/google`。`pnpm build` 通過。

- **Phase 10 — 修改密碼（Change Password，登入中）** — 2026-07-06 完成。Settings 頁 Profile 與 Session 之間新增「Password」section；`change-password-form.tsx`（client）用 `authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })`，client 端驗新密碼＝確認、`minLength={8}`，成功後 `form.reset()` 並顯示「已更新、其他裝置已登出」。與 Phase 9（登出救援）互補；A 案假設每人都有密碼。**待辦**：Google 登入上線後須改條件式 UI（見上方路線圖 ⚠️）。`pnpm build` 通過。

- **Phase 9 — 忘記密碼（Forgot / Reset Password）** — 2026-07-06 完成。安裝 `resend`；新增 `src/lib/email.ts`（`sendEmail`，SDK 回 `{data,error}` 不 throw，無 `RESEND_API_KEY` 時把信印到 server console 供本地測試）與 `src/lib/emails/reset-password.ts`（inline HTML editorial 樣式信）。`auth.ts` 的 `emailAndPassword` 加上 `sendResetPassword`（寄 Resend 信）與 `revokeSessionsOnPasswordReset: true`。新增 `/forgot-password`（`authClient.requestPasswordReset({ email, redirectTo: origin+"/reset-password" })`，不論帳號存在與否都顯示相同成功訊息避免帳號探測）與 `/reset-password`（Better Auth 驗 token 後導回本頁帶 `?token=`／`?error=INVALID_TOKEN`；表單新密碼＋確認→`authClient.resetPassword`→導回 `/login`；token 失效顯示重新索取連結）。登入頁密碼欄下方加「Forgot password?」連結。此流程即未來 Google OAuth 使用者補設密碼的官方路徑。寄件者 `.env` 用 `EMAIL_FROM=onboarding@resend.dev`（未驗證網域僅能寄到 Resend 帳號信箱）。`pnpm build` 通過。

- **Phase 8 — AI Brew Master（詢問 AI 沖煮導師）** — 2026-07-06 完成。Brew 詳情頁在評分＋五項 TasteScale 填完後新增「Ask the Brew Master」區塊；`askBrewMaster` server action 彙整沖煮參數、豆子背景（含 `flavor_notes`）與同豆歷史沖煮，交給 `gemini-3.5-flash`（`generateText`, `thinkingLevel: "minimal"`）產生沖煮建議，跟隨 taster notes 語言（fallback `Accept-Language`）；建議存 `brew_advice`（按 brewId 快取，編輯 brew 時失效）；`brew_advice_usage` 每人每月 10 次上限，並將豆袋掃描額度同步由每日 20 次改為每月 10 次（欄位 `day` → `period`）。
- **Phase 7 — AI 智慧填單（拍豆袋照片自動建豆）** — 2026-07-06 完成。`/beans/new` 掃描豆袋照片 → `gemini-3.5-flash`（`generateObject` + nullable schema、`thinkingLevel: "low"`）辨識 → 預填表單（human in the loop，照片不落地）；client canvas 壓縮、iPhone 上傳／桌面拖拉、`bean_scan_usage` 每日 20 次上限＋剩餘額度顯示。
- **咖啡沖煮筆記網站（Coffee Brew Journal）** — 2026-07-05 完成，squash-merge 至 main（`77dc0d1`）。Phase 1–6 全數完成：editorial design 風格系統、Better Auth 會員、Beans/Brews CRUD（動態欄位、比例計算、TasteScale）、公開個人頁 `/u/[username]` 與 `/explore`、篩選／空狀態／375px 實測／build 通過。
