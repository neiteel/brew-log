# Current Feature

## Status

Not Started

## Goals

<!-- Bullet points of what success looks like -->

## Notes

<!-- Additional context, constraints, or details from spec -->

### 待辦提醒（承前，未做）

- **Google 登入正式上線前**：GCP 補 production redirect URI；Vercel 設 `GOOGLE_CLIENT_ID/SECRET`、`BETTER_AUTH_URL`、`RESEND_API_KEY`。
- **寄件網域**：目前 `onboarding@resend.dev` 只能寄到 Resend 帳號信箱（neiteel@gmail.com）。要真正寄給任何使用者（驗證信／重設信）必須先在 Resend 驗證自有網域並改 `EMAIL_FROM`。

### 後續路線圖（2026-07-06 討論）

- **i18n 繁中**：實作前先讀 `node_modules/next/dist/docs/` 的 i18n 指南，不可直接套 next-intl 常規做法。

## History

- **Phase 14 — Explore 社群評分（★5）** — 2026-07-06 完成。會員可幫**別人**的公開 brew 打★1–5,把「值不值得試」的社群訊號帶進 Explore。① 新表 `brew_ratings`（`schema.ts`,`userId`+`brewId` 複合主鍵、`value` 1–5、`brewId` index）,與作者自評 `brews.rating`(1–10,AI Brew Master 仍用)分離。② `src/app/(app)/brews/[id]/rating-actions.ts`：`rateBrew`（upsert,`onConflictDoUpdate`）/`removeRating`,授權檢查須登入、`brew.isPublic`、非本人;revalidate 詳情頁 + `/explore`。③ `src/lib/ratings.ts` 的 `getRatingSummary`（avg + count + 本人票）。④ editorial 星星 `src/components/star-meter.tsx`（前景色實心 + 邊框空心,支援小數部分填色,server/client 共用）;`star-rating.tsx`（client,optimistic + `router.refresh()`,可改分/Clear）。⑤ 詳情頁公開 brew 加 Community section:人人看★平均與票數,登入且非本人才可評。⑥ `/explore` group-by 子查詢聚合★平均,列表把 `x/10` 換成 `★★★★☆ 4.3 (12)`,col-span 重新平衡(標題4+星2+烘豆商·使用者4+日期2)不刪元素;排序維持新著順。不做留言、不做倒讚、不加 Top rated（取代路線圖原本的 `brew_likes` 只做讚方案）。`pnpm build`、`pnpm lint` 皆通過。

- **Phase 13 — 資料上限 + 列表分頁 + Bulk Seed** — 2026-07-06 完成，squash-merge 至 main（`d0648a0`）。① `src/lib/limits.ts`：每人 10 豆 / 50 brews，create server action insert 前 count 擋下並回友善錯誤；`/beans/new`、`/brews/new` 達上限直接顯示訊息取代表單，未達上限 header 顯示「x of N used」。② 分頁：共用 `src/components/pagination.tsx`（`PAGE_SIZE = 10`、page-based searchParams、Prev/Next + "Page X of Y"、page 參數 clamp、`scroll` prop）套用 `/explore`（保留篩選、換頁回頂）、`/journal`（`?beans=&brews=` 獨立參數、`scroll={false}` 原地換頁）、`/u/[username]`。③ Journal Brews 加 Bean + Method filter：`next/form` 的 `<Form scroll={false}>` 讓 Apply／Clear 也原地不動，套 filter 時 brews 回第 1 頁、beans 頁碼 hidden input 保留；Beans 上限 10 顆單頁全覽不做 filter。④ `src/lib/db/seed-bulk.ts` + `pnpm db:seed:bulk`：產生 25 豆 / 120 brews（`BULK_BEANS`/`BULK_BREWS` 可調）測試資料，直接 insert 刻意繞過上限；原 `pnpm db:seed` 精緻示範資料保留。`pnpm build` 通過（lint 因既有的 eslint-plugin-react 相容性問題無法跑）。

- **Phase 12b — Google 使用者 username 補齊** — 2026-07-06。實測發現 Google 註冊者沒有 username → 公開頁 `/u/[username]` 失效。`auth.ts` 加 `databaseHooks.user.create.before`：建立時若無 username，就從 email local-part 產生合法且唯一的 username（`generateUniqueUsername`，符合 3–30 字、`[a-z0-9_.]`，衝突加隨機尾碼），同時填 `displayUsername`。使用者仍可在 Settings 改。**注意**：此 hook 只對「之後新建」的使用者生效；先前已建立的 Google 帳號（username 為 null）需自行到 Settings 設一個。

- **Phase 12 — Email 驗證（Email Verification + 安全帳號連結）** — 2026-07-06 完成。修 Phase 11 實測到的 `account_not_linked`（同 email 先密碼註冊、再 Google 登入被擋）。`auth.ts` 加 `emailVerification`（`sendOnSignUp` + `autoSignInAfterVerification` + Resend 寄 `verify-email.ts`），並把 accountLinking 的 `requireLocalEmailVerified` 從 Phase 11 臨時的 `false` 改回安全預設（擋帳號預劫持）。不開 `requireEmailVerification`（不擋登入，避免鎖死 dev 帳號與現有未驗證帳號）。signup 傳 `callbackURL=/journal`；`signIn.social` 加 `errorCallbackURL=/login`，登入頁讀 `?error=` 顯示友善訊息（`account_not_linked` → 引導用密碼登入、驗證後再用 Google）。`pnpm build` 通過。

- **Phase 11 — Google 登入（Social Sign-in + Account Linking）** — 2026-07-06 完成。`auth.ts` 加 `socialProviders.google`（clientId/secret 走 env）與 `account.accountLinking: { enabled: true, trustedProviders: ["google"] }`。新增共用 `src/components/social-auth.tsx`（「or」分隔線＋帶 Google G logo 的「Continue with Google」按鈕，`authClient.signIn.social({ provider: "google", callbackURL: "/journal" })`），放進登入頁與註冊頁。**連帶改 Settings 密碼區為條件式**：settings（server component）用 `auth.api.listUserAccounts` 查有無 `providerId:"credential"`——有→`ChangePasswordForm`；沒有（Google-only）→新增 `SetPasswordForm`（呼叫 `set-password-action.ts` 這個 server action → server-only `auth.api.setPassword({ body:{ newPassword } })`，成功即建立 credential account，`router.refresh()` 後改顯示 Change 表單）。`account` 表既有 OAuth 欄位（accessToken/idToken 等），免 migration。GCP redirect URI 需含 `http://localhost:3000/api/auth/callback/google`。`pnpm build` 通過。

- **Phase 10 — 修改密碼（Change Password，登入中）** — 2026-07-06 完成。Settings 頁 Profile 與 Session 之間新增「Password」section；`change-password-form.tsx`（client）用 `authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })`，client 端驗新密碼＝確認、`minLength={8}`，成功後 `form.reset()` 並顯示「已更新、其他裝置已登出」。與 Phase 9（登出救援）互補；A 案假設每人都有密碼。**待辦**：Google 登入上線後須改條件式 UI（見上方路線圖 ⚠️）。`pnpm build` 通過。

- **Phase 9 — 忘記密碼（Forgot / Reset Password）** — 2026-07-06 完成。安裝 `resend`；新增 `src/lib/email.ts`（`sendEmail`，SDK 回 `{data,error}` 不 throw，無 `RESEND_API_KEY` 時把信印到 server console 供本地測試）與 `src/lib/emails/reset-password.ts`（inline HTML editorial 樣式信）。`auth.ts` 的 `emailAndPassword` 加上 `sendResetPassword`（寄 Resend 信）與 `revokeSessionsOnPasswordReset: true`。新增 `/forgot-password`（`authClient.requestPasswordReset({ email, redirectTo: origin+"/reset-password" })`，不論帳號存在與否都顯示相同成功訊息避免帳號探測）與 `/reset-password`（Better Auth 驗 token 後導回本頁帶 `?token=`／`?error=INVALID_TOKEN`；表單新密碼＋確認→`authClient.resetPassword`→導回 `/login`；token 失效顯示重新索取連結）。登入頁密碼欄下方加「Forgot password?」連結。此流程即未來 Google OAuth 使用者補設密碼的官方路徑。寄件者 `.env` 用 `EMAIL_FROM=onboarding@resend.dev`（未驗證網域僅能寄到 Resend 帳號信箱）。`pnpm build` 通過。

- **Phase 8 — AI Brew Master（詢問 AI 沖煮導師）** — 2026-07-06 完成。Brew 詳情頁在評分＋五項 TasteScale 填完後新增「Ask the Brew Master」區塊；`askBrewMaster` server action 彙整沖煮參數、豆子背景（含 `flavor_notes`）與同豆歷史沖煮，交給 `gemini-3.5-flash`（`generateText`, `thinkingLevel: "minimal"`）產生沖煮建議，跟隨 taster notes 語言（fallback `Accept-Language`）；建議存 `brew_advice`（按 brewId 快取，編輯 brew 時失效）；`brew_advice_usage` 每人每月 10 次上限，並將豆袋掃描額度同步由每日 20 次改為每月 10 次（欄位 `day` → `period`）。
- **Phase 7 — AI 智慧填單（拍豆袋照片自動建豆）** — 2026-07-06 完成。`/beans/new` 掃描豆袋照片 → `gemini-3.5-flash`（`generateObject` + nullable schema、`thinkingLevel: "low"`）辨識 → 預填表單（human in the loop，照片不落地）；client canvas 壓縮、iPhone 上傳／桌面拖拉、`bean_scan_usage` 每日 20 次上限＋剩餘額度顯示。
- **咖啡沖煮筆記網站（Coffee Brew Journal）** — 2026-07-05 完成，squash-merge 至 main（`77dc0d1`）。Phase 1–6 全數完成：editorial design 風格系統、Better Auth 會員、Beans/Brews CRUD（動態欄位、比例計算、TasteScale）、公開個人頁 `/u/[username]` 與 `/explore`、篩選／空狀態／375px 實測／build 通過。
