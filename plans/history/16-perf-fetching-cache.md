# 16. Perf：fetching / cache 優化

依 `vercel-react-best-practices` skill 全審程式碼後,挑出高效益、低風險的重構執行。整體程式碼品質高,只有少數幾個真正值得動的點。

## 做了什麼

- **F1 `getSession` per-request 去重**(`server-cache-react`)— 用 `React.cache()` 包住 [src/lib/session.ts](../../src/lib/session.ts) 的 `getSession`。`auth.ts` 未開 cookieCache,`auth.api.getSession` 每次都查 DB;layout + page 各呼叫一次 → 每個授權頁至少 2 次 DB round-trip 取同一份 session。去重後每頁省一次。全站受益、零行為改變。
- **F2 Brew 詳情頁抓取併行**(`server-parallel-fetching`)— [src/app/(app)/brews/[id]/page.tsx](<../../src/app/(app)/brews/[id]/page.tsx>) 原本 advice 的 `Promise.all` 與 `getRatingSummary` 串行,兩者無依賴,合併成單一 `Promise.all`。
- **F4 移除未用依賴**(bundle 衛生)— `lucide-react`、`@phosphor-icons/react` 全專案零 import(star 是自繪 SVG),`pnpm remove` 清掉。

## 刻意沒做

- **F3 Explore 併行化** — 初審誤判為可優化,實作時重新分析發現**原碼已最佳**:`entries` 需 offset(依賴 count),count 必須在前;而三個 distinct 篩選查詢已在 batch 2 與 `entries` 併行跑。把它們移到 batch 1、讓 `entries` 獨佔 batch 2 反而會讓 `entries` 變成累加在後,critical path 相等或更差。故不動。
- **F5 Better Auth cookieCache** — 是行為取捨(session staleness)非純重構,拆到 build-plan feature 18,建議與付費分級一起做。設計約束已備料在 build-plan.md。
- **低效益項**:`new-bean`/`new-brew` 的 count→quota 串行(中間有 early-return gate,並行會多打無用查詢)、`journal`/`u[username]` 的 count→offset(合理依賴)、`BrewForm` 受控 state 重繪(欄位輕、改動風險 > 收益)。

## 驗證

`pnpm build` 通過。squash-merge 到 main:`f52191c`。
