# Current Feature: Phase 13 — 資料上限 + 列表分頁 + Bulk Seed

## Status

Completed (2026-07-06)

## Goals

- **Bulk seed**：新增 `src/lib/db/seed-bulk.ts` + `pnpm db:seed:bulk`。給 `test@example.com` 產生大量隨機資料（預設 25 豆 / 120 brews，`BULK_BEANS`/`BULK_BREWS` env 可調），方法／產地／烘焙度從固定池隨機、rating 與五項 taste 隨機、`brewedAt` 分散過去一年、約半數 `isPublic`。冪等（先清該 user 的 beans/brews）。直接走 db insert **刻意繞過上限**，方便做出「已達上限」與「多頁」的測試狀態。現有 `seed.ts`（精緻示範資料）保留不動。
- **資料上限**：`src/lib/limits.ts` 定義 `MAX_BEANS_PER_USER = 10`、`MAX_BREWS_PER_USER = 50`（產品決定，2026-07-06 拍板）。只在 create server action 擋（insert 前 count，達上限回友善錯誤）；edit/delete 不影響；無 schema 變更。new bean / new brew 頁顯示「x / 上限」提示。
- **列表分頁**：page-based（searchParams），每頁 10 筆（人工測試後從 20 調降）。共用 `<Pagination>` server component（Prev/Next 底線連結 + "Page X of Y"，merge 現有 searchParams，`scroll` prop 控制換頁後是否捲回頂部）。頁面：① `/explore`（保留 method/origin/roast 篩選參數；換頁回頂部）② `/journal`（Beans、Brews 兩列表獨立參數 `?beans=&brews=`，`scroll={false}` 原地換頁）③ `/u/[username]`。查詢用 `limit/offset` + `count(*)`；page 參數 clamp。首頁 `.limit(6)` 與 brew form 豆子下拉（有上限後全撈可接受）不動。
- **Journal Brews filter**（人工測試後追加）：Brews 區加 Bean + Method 下拉（複用 explore 的 filter form 模式），用 `next/form` 的 `<Form scroll={false}>` 讓 Apply / Clear filters 也原地不動；套 filter 時 brews 回第 1 頁、beans 頁碼用 hidden input 保留；換頁連結帶著 filter。Beans 上限 10 顆單頁全覽，不需 filter。

## Notes

- 實作順序：seed → 上限 → 分頁（explore 先定模式，再 journal、`/u/[username]`）。
- 動手寫分頁前先讀 `node_modules/next/dist/docs/` 的 searchParams / Link 指南確認 API。
- 上限 10 豆 / 50 brews 之下，beans 列表（≤10）正常情況不會翻頁——分頁元件仍套上，靠 bulk seed 超額資料驗證。

## 待辦提醒（承前，未做）

- **Google 登入正式上線前**：GCP 補 production redirect URI；Vercel 設 `GOOGLE_CLIENT_ID/SECRET`、`BETTER_AUTH_URL`、`RESEND_API_KEY`。
- **寄件網域**：目前 `onboarding@resend.dev` 只能寄到 Resend 帳號信箱（neiteel@gmail.com）。要真正寄給任何使用者（驗證信／重設信）必須先在 Resend 驗證自有網域並改 `EMAIL_FROM`。

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
