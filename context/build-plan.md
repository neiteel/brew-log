# Build Plan

> 一行一個 feature，按大致順序排。`- [x]` 表示已完成（詳細紀錄在
> `context/history/NN-name.md`）。`/feature` 不帶 spec 時，預設 spec 下一個
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

## 上線前提醒（非 feature，部署時處理）

- **Google 登入正式上線前**：GCP 補 production redirect URI；Vercel 設 `GOOGLE_CLIENT_ID/SECRET`、`BETTER_AUTH_URL`、`RESEND_API_KEY`。
- **寄件網域**：目前 `onboarding@resend.dev` 只能寄到 Resend 帳號信箱（neiteel@gmail.com）。要真正寄給任何使用者（驗證信／重設信）必須先在 Resend 驗證自有網域並改 `EMAIL_FROM`。
