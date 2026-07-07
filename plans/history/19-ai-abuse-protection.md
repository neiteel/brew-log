# 19. AI 濫用防護

> 完成於 2026-07-07，分支 `feature/ai-abuse-protection`。上線 Vercel 前的防護。

## 做了什麼

收斂 AI 功能的攻擊面（原本只有登入牆 + 每人每月 10+10 次，腳本可大量開帳號各領額度）。兩道防線：

1. **`emailVerified` 把關**：AI 掃描與 Brew Master 要求信箱已驗證，逼攻擊者需真實可收信信箱。
2. **註冊限流真正生效**：Better Auth `rateLimit` 改用 Upstash Redis 作 secondary storage（不再是記憶體，Vercel 多實例/冷啟動共享計數），`/sign-up/email` 設同 IP 每小時 ≤ 5 次。

## 關鍵檔案

- `src/lib/redis.ts` — 新增。Upstash REST client。**關鍵**：`automaticDeserialization: false`，否則 client 會對 GET 自動 `JSON.parse`，但 Better Auth 存的是 JSON 字串、取回自己 parse，雙重 parse 會壞掉。
- `src/lib/auth.ts` — 加頂層 `secondaryStorage`（`get`/`set`/`delete` + optional 原子 `increment`：`redis.incr` 首次再 `expire`，多實例限流才正確）；加 `rateLimit: { enabled, storage: "secondary-storage", customRules: { "/sign-up/email": { window: 3600, max: 5 } } }`。
- `src/app/(app)/beans/scan.ts`、`src/app/(app)/brews/advice.ts` — 於 `requireSession()` 後、動額度前加 `if (!session.user.emailVerified)` 閘，回友善英文錯誤。放在額度預留 insert **之前**，未驗證不消耗計數。
- `package.json` / `.env.example` — 加 `@upstash/redis` 依賴與 `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`。

## 決策與備註

- **`customRules` key = `/sign-up/email`（不含 `/api/auth` 前綴）** —— 對照 better-auth 1.6.23 原始碼確認：rate-limiter 用 `normalizePathname` 把 basePath 剝掉才比對。better-auth-security skill 範例寫的 `/api/auth/sign-up/email` 在這版是錯的。
- **`rateLimit.enabled` 設 `process.env.NODE_ENV === "production"`**：Better Auth 本來就只在 production 預設開；明確化，讓 dev 反覆測註冊/驗證流程不被限流擋。要在 dev 驗限流時暫時改 `true`。
- AI 錯誤字串維持英文（i18n 統一歸 feature 17）；每月額度數字（10/月）不調低——單一用戶打滿不到台幣一元，錢包風險由 Gemini 免費層 key 兜底。
- 驗證方式：連打 7 次 `/sign-up/email`，第 6、7 次回 429（max 5），Redis 見限流計數 key + session key（secondaryStorage 同時服務 session 正常），測試帳號與 key 已清；`pnpm build`、`pnpm lint` 通過。`emailVerified` 閘由使用者以自己 email 走完整流程手動驗證通過。
- **上線前置**：Resend 網域須先驗證（否則真實用戶收不到驗證信，`emailVerified` 閘會誤擋所有人）；Vercel 補 `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`。
- 附帶清理：本次一併移除未使用的 redis-* 與 iris-development skill（限流靠 better-auth security skill + 直讀原始碼，沒用到那些）。
