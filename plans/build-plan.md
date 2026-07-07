# Build Plan

> 一行一個 feature，按大致順序排。`- [x]` 表示已完成（詳細紀錄在
> `plans/history/NN-name.md`）。`/feature` 不帶 spec 時，預設 spec 下一個
> 未勾選項目。

## Features

- [x] 1–6. 咖啡沖煮筆記網站基礎（editorial 設計系統、Better Auth、Beans/Brews CRUD、公開頁、Explore）→ [history/01-06-coffee-brew-journal.md](history/01-06-coffee-brew-journal.md)
- [x] 7. AI 智慧填單（拍豆袋照片自動建豆）→ [history/07-ai-bean-scan.md](history/07-ai-bean-scan.md)
- [x] 8. AI Brew Master（詢問 AI 沖煮導師）→ [history/08-ai-brew-master.md](history/08-ai-brew-master.md)
- [x] 9. 忘記密碼（Forgot / Reset Password）→ [history/09-forgot-password.md](history/09-forgot-password.md)
- [x] 10. 修改密碼（Change Password）→ [history/10-change-password.md](history/10-change-password.md)
- [x] 11. Google 登入（Social Sign-in + Account Linking）→ [history/11-google-login.md](history/11-google-login.md)
- [x] 12. Email 驗證 → [history/12-email-verification.md](history/12-email-verification.md)
- [x] 12b. Google 使用者 username 補齊 → [history/12b-google-username-backfill.md](history/12b-google-username-backfill.md)
- [x] 13. 資料上限 + 列表分頁 + Bulk Seed → [history/13-limits-pagination-bulk-seed.md](history/13-limits-pagination-bulk-seed.md)
- [x] 14. Explore 社群評分（★5）→ [history/14-community-ratings.md](history/14-community-ratings.md)
- [x] 15. i18n 繁中（en / zh-Hant）→ [history/15-i18n-zh-hant.md](history/15-i18n-zh-hant.md)
- [x] 16. Perf：fetching / cache 優化（getSession 去重 + brew 詳情頁併行 + 清未用依賴）→ [history/16-perf-fetching-cache.md](history/16-perf-fetching-cache.md)
- [ ] 17. i18n 後續鋪設：journal / explore 列表、導覽列（app-nav / site-header）、登入/註冊/Settings 其餘 chrome、各頁 `metadata.title`、enum 選項值（沖煮方式/國家/處理法/烘焙度）與 placeholder 範例。沿用同模式（server 直接 `getDictionary`、client 收切片）。
- [ ] 18. Better Auth `session.cookieCache`（跨 request 省 session DB 查詢；建議與付費分級一起做）。目前未開，`auth.api.getSession` 每次查 DB；feature 16 的 `React.cache` 只解決同一 request 內的重複。啟用要點：
  - `session.cookieCache: { enabled: true, maxAge: 60~300 }`，maxAge 短一點把 staleness 窗壓小。
  - **鐵則**：cookie 只服務渲染（身分／`locale`／方案徽章）；**額度上限與用量一律讀 DB**。用量本來就即時查 DB（`countBeans/countBrews`、`brewAdviceUsage`、`bean_scan_usage`），不受影響。
  - **i18n 小修（一行）**：[language-form.tsx](<../src/app/(app)/settings/language-form.tsx>) 在 `updateUser({ locale })` 後、`router.refresh()` 前加 `await authClient.getSession({ query: { disableCookieCache: true } })`，否則 refresh 讀到舊 locale 的快取 cookie。i18n 架構不需改。
  - **付費分級把關**：tier 放 subscription 表或 user 欄位皆可，但把關的 server action（`createBrew`/`askBrewMaster`/`scanBeanPhoto`）要 fresh 讀 tier（查 DB 或 `getSession({ query: { disableCookieCache: true } })`）；升級 webhook 刷新 cookie 讓方案即時生效。
  - 驗證：改語言即時生效、改密碼登出全裝置的失效窗 ≤ maxAge。
- [ ] 19. AI 濫用防護（上線 Vercel 前做）。現況：AI 只有登入牆 + 每人每月 10+10 次，攻擊面是「腳本大量開帳號領額度」。兩件事：
  - **AI 功能加 `emailVerified` 把關**：在 `scanBeanPhoto`（[scan.ts](<../src/app/(app)/beans/scan.ts>)）與 `askBrewMaster`（[advice.ts](<../src/app/(app)/brews/advice.ts>)）的 session 檢查後加 `session.user.emailVerified` 檢查，未驗證回友善錯誤。迫使攻擊者要有真實收件信箱，成本大增。**前置條件：Resend 網域先驗證**，否則真用戶也收不到驗證信會被誤擋。
  - **Better Auth `rateLimit`**：production 預設已啟用（同 IP 視窗限流），但預設存記憶體，在 Vercel serverless 每次冷啟動歸零、多實例不共享 → 形同虛設。要配 `rateLimit.storage: "secondary-storage"` 接 Upstash Redis（本來就在 stack 內），並對 `/sign-up/email` 設更嚴的 `customRules`（例如同 IP 每小時 ≤ 5 次註冊）。
  - 額度數字（10/月）不用調低——單一用戶打滿約不到台幣一元，錢包風險由 Gemini 免費層 key 兜底（見上線前提醒）。
- [x] 20. 一鍵匯出沖煮資料（下載式，不開 API）→ [history/20-export-brew-data.md](history/20-export-brew-data.md)。CSV 加值未做；按鈕文案 i18n 歸 feature 17。

## 上線前提醒（非 feature，部署時處理）

- **Google 登入正式上線前**：GCP 補 production redirect URI；Vercel 設 `GOOGLE_CLIENT_ID/SECRET`、`BETTER_AUTH_URL`、`RESEND_API_KEY`。
- **寄件網域**：目前 `onboarding@resend.dev` 只能寄到 Resend 帳號信箱）。要真正寄給任何使用者（驗證信／重設信）必須先在 Resend 驗證自有網域並改 `EMAIL_FROM`。Resend 免費層額度綁帳號（換 key 不會變多）：**3,000 封/月、100 封/日**，網域驗證本身免費，這個量級對本專案綽綽有餘。
- **Gemini API key**：production 用 **AI Studio 免費層 key（不綁信用卡）**——最壞情況是額度用完請求失敗，零金錢風險。目前開發用的 key 不是免費層，上線前另建。
- **公開 repo**：git 歷史已掃過無密鑰（2026-07 確認）。公開 repo （Resend 網域未驗證期間，使用者註冊收不到驗證信）。
