# 20. 一鍵匯出沖煮資料

> 完成於 2026-07-07，分支 `feature/export-brew-data`（跳過 17–19 先做，由使用者指定）。

## 做了什麼

Settings 頁一顆按鈕，下載自己全部 beans + brews 的 JSON。下載式（`Content-Disposition: attachment`），不開對外 API。

## 關鍵檔案

- `src/app/api/export/route.ts` — GET route handler：`getSession()` 驗 session（未登入回 401 JSON），`Promise.all` 並行撈該使用者全部 beans + brews（`createdAt` 升冪），回傳 `{ exportedAt, beans, brews }`，帶 `Content-Disposition: attachment; filename="brew-log-export.json"`
- `src/app/(app)/settings/export-button.tsx` — client 元件，沿用現成 `TextButton`（比照 `sign-out-button.tsx` 寫法），`onClick` 導向 `/api/export` 觸發下載
- `src/app/(app)/settings/page.tsx` — 新增「Data」區塊（Password 與 Session 之間）放按鈕

## 決策與備註

- `getSession()`（包 `React.cache`）在 route handler 可直接用——`cache` 在非 render 環境是 no-op；不用 `requireSession()` 因為它會 redirect，API 應回 401
- 匯出全欄位 + `exportedAt`；不含 ratings / usage 表。資料量在 feature 13 的上限內，一次全撈、不分頁
- CSV 這輪不做（build-plan 註明可加值）；按鈕文案未 i18n（Settings 其餘 chrome 也還沒做，屬 feature 17 範圍）
- 驗證方式：curl 未登入 401；sign-up API 建臨時帳號 + 臨時 seed 腳本塞一筆 bean/brew 實測下載內容正確（測畢已刪帳號）；`pnpm build`、`pnpm lint` 通過
