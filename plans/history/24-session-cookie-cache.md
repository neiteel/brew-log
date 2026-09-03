# 24. Better Auth `session.cookieCache`

分支 `feature/session-cookie-cache`，2026-09-03。build-plan 第 18 條。

## 做了什麼

打開 Better Auth 的 session cookie cache，讓每個 request 用一個簽章 cookie 還原
session + user，不必再向外部儲存層要一次。

**production 改動只有 5 行 config**（`src/lib/auth.ts`）：

```ts
session: {
  cookieCache: { enabled: true, maxAge: 300 },
},
```

其餘改動全是註解修正，見下方「連帶修掉的錯誤註解」。

## 實測數字

| 項目 | 結果 |
|---|---|
| 開之前 | 每個已登入 request **1 次** Upstash GET（`/settings` 2 次） |
| 開之後 | **0 次**（`/journal`、`/settings`、`/brews/new`） |
| 失效窗 | 撤銷 session 後舊裝置還能存取 **296–306 秒**（符合 `maxAge: 300`） |
| cookie 大小 | `session_data` **982 bytes**，每個同源 request 都會上傳 |

方法：暫時在 `secondaryStorage.get` 包一層 `console.log`，用 curl 帶 cookie 打頁面，
數 dev server log 的行數。測完拆掉。

## 三個推翻原本計畫的查證結果

**1. build-plan 第 18 條的前提是錯的。** 原文寫「`auth.api.getSession` 每次查 DB」。
feature 19 加上 `secondaryStorage` 之後這句就不成立了：Better Auth 的
`storeSessionInDatabase` 在有 secondary storage 時預設 false，`findSession` 直接
`secondaryStorage.get(token)`，回傳的 JSON 同時含 `session` 與 `user`，**完全不碰
Postgres**。所以這個 feature 省的是一次 Upstash HTTP round-trip，不是一次 DB query。
收益仍然實在（serverless 到 Upstash 是跨網路請求），但量級不同。

**2. build-plan 指定的「i18n 小修（一行）」不必做。** 原本要在 `language-form.tsx`
的 `updateUser()` 後、`router.refresh()` 前補一次
`getSession({ query: { disableCookieCache: true } })`。實際上 Better Auth 的
`/update-user` 自己就會 `setSessionCookie(ctx, { session, user: updatedUser })`
（`update-user.mjs:69`），`/change-password` 與 `/verify-email` 同樣會重寫。
實測：`updateUser({ locale: "zh-Hant" })` 後 cookie 立刻帶新 locale，下一個 request
就是 `<html lang="zh-Hant">`。**因此兩個 Settings 表單一行都沒改，也沒有新增
`refreshSession()` helper。**

**3. `refreshCache` 絕對不能開。** 若開啟，Better Auth 會拿 **cookie 自己的內容**
重簽 cookie 而不查儲存層（`session.mjs:120-153`），等於讓活躍 session 無限續命、
完全繞過撤銷。它預設 `false`，而且一旦設了 `secondaryStorage` 就會被強制關閉並印
警告（`create-context.mjs:152`）。**不要為了省流量去打開它。**

## 安全邊界：cookie 只服務渲染

鐵則是「cookie 只服務渲染，額度一律讀 DB」。查證後現況本來就符合——
`countBeans`/`countBrews`（`lib/limits.ts`）、`brewAdviceUsage`、`beanScanUsage`
都是拿 `session.user.id` 去查 DB，沒有任何一處從 session 物件讀用量，而 cookie 裡
根本沒有計數欄位。

實測驗證：把 `MAX_BREWS_PER_USER` 暫時改成 1，用**完全沒變動的 cookie**、在 **0 次
Upstash GET** 的情況下打 `/brews/new`，仍然被擋下。

全站非 `id` 的 `session.user` 讀取共 5 處，逐一確認都安全：

- `beans/scan.ts:151`、`brews/advice.ts:176` — `emailVerified` 把關（AI 功能）
- `settings/page.tsx:46,54` — `emailVerified` 顯示
- `i18n/index.ts:71` — `locale`
- `journal/page.tsx:94` — `session.user.name`（本站沒有改名表單）
- `brews/[id]/page.tsx:113,117` — 看起來像但不是：那是 DB join 來的 `brew.user.username`

`emailVerified` 有實跑完整流程驗證（暫時 log 驗證連結 → 打 `/api/auth/verify-email`）：
驗證後 cookie 立刻 `emailVerified: true`，`/settings` 立刻顯示 Verified，AI 把關不會
把剛驗證完的人擋在外面。

## 唯一的取捨

`revokeSessionsOnPasswordReset` 從即時變成**最多慢 5 分鐘**。要縮短就把 `maxAge`
調小，一行。之所以取建議區間（60~300）的上限，是因為改密碼登出全裝置本來就不是
即時安全邊界。

另一個成本是每個 request 多上傳約 1KB（982 bytes 的 cookie）。

## 連帶修掉的錯誤註解

feature 19 把 session 儲存位置從 Postgres 搬到 Upstash，但兩個檔案的註解都沒跟著更新：

- `src/lib/session.ts` — 原本寫「`auth.api.getSession` hits the database on every call」。
  這是 feature 16 寫的，當時為真。
- `src/lib/redis.ts` — 原本只說自己裝 rate-limit storage，沒說 session 也在裡面。

這兩段錯誤註解正是本次一開始帶著錯誤前提進場的原因，所以一併修掉。

## 給之後重測的人：這個失效窗數字量了三次才對

前兩次都是無效讀數，寫在這裡免得再踩：

1. **「1169s」** — poll 迴圈卡在單一個**沒有 timeout** 的 curl 裡約 17 分鐘，最後回報的
   是 wall-clock，不是失效時刻。→ 每個 curl 都要加 `-m`。
2. **「6s」** — device A 的 sign-in 撞到 Turbopack 冷編譯、在 10s timeout 被砍掉，
   cookie jar 是空的，它從來沒登入成功過；「鎖出」其實只是「本來就沒進去」。
   → 測量前先 warm-up 要打的每條 route，並且**斷言前置條件**（jar 裡真的有
   `session_data`、precheck 拿到 200）才開始計時。

第三次加了 warm-up 與前置檢查才拿到 296–306s 這個有效讀數。

## 沒做的事

- **付費分級**：build-plan 建議與此一起做，但付費功能還不存在，沒有預埋 tier 欄位或
  抽象。把關方式（server action fresh 讀 tier、升級 webhook 刷 cookie）留在 build-plan
  第 18 條，等真的做付費時再處理。
- **測試**：這個 feature 沒有可單元測試的邏輯（一個 config flag + 註解），真正要驗的
  全是需要真 cookie／真 Redis／真時間的觀測項，已用實測完成。額度那條鐵則由型別擋著
  ——用量不在 session type 上，`session.user.brewCount` 編譯不過。
