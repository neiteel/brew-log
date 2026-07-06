# Current Feature: Phase 8 — AI Brew Master（詢問 AI 沖煮導師）

## Status

Completed

## Goals

- Brew 詳情頁（自己的 brew）新增「Ask the Brew Master」區塊，只有在**評分 + 五項 TasteScale 全部填完**時才啟用（未填完顯示提示，不出現按鈕）。
- 點擊後由 AI 導師針對這一杯給出**下一步沖煮調整建議**：輸入包含本次沖煮參數、豆子背景（含 `flavor_notes` 作為烘豆商預期風味）、以及**同一支豆子的歷史沖煮**（參數＋風味＋評分）以供比較。
- 建議**存 DB（一杯一列）避免重複計費**；可「Regenerate」重新產生（覆寫、計入每日額度）。
- 每人每 UTC 日設生成上限（沿用 Phase 7 的 DB 計數模式，不引入 Redis）。
- **不做 AI 生成 Notes**（避免 AI 分析 AI 的循環）；AI 只給沖煮建議，不回寫 brew 的欄位。

## Notes

- **模型 / SDK**：沿用 Phase 7 的 Vercel AI SDK（`ai` v7 + `@ai-sdk/google`）＋ `gemini-3.5-flash`；用 `generateText`（散文建議，非結構化）。`thinkingLevel: "minimal"`——給建議非精準抽取任務，用 minimal 換較低延遲（Phase 7 讀標籤才需避開 minimal）。
- **導師回覆語言**：跟隨使用者 **taster notes 的語言**（主訊號，system prompt 指示）；notes 為空時 fallback 用請求的 `Accept-Language`（`preferredLocale()` 讀 header → `Intl.DisplayNames` 轉可讀語言名）、再退回英文。目的：其他國家使用者即使 UI 是英文也能拿到母語建議。此區塊的**介面文案**仍維持英文（與現有 UI 一致），只有 AI 生成內容跟隨語言。
- **快取失效（策略 A）**：advice 以 `brewId` 快取；**編輯該 brew 時在 `updateBrew` 刪除快取列**（參數變了舊建議即失效）。豆子背景變動或新增同豆沖煮不自動失效，交給手動 Regenerate。
- **資料表**：
  - `brew_advice`：`brewId`（PK, FK→brews cascade）、`advice` text、`model` text、`createdAt`。一杯一列 = 快取。
  - `brew_advice_usage`：`(userId, period)` PK、`count`——每月生成上限計數，仿 `bean_scan_usage`。
- **額度**：豆袋掃描與 Brew Master **各自每月 10 次**（原每日 20，2026-07-06 改）。計數欄位由 `day`（每日）改為 `period`（當月 1 號 "YYYY-MM-01"）；兩張 usage 表同步。測試重置：Drizzle Studio 刪掉該 `(user, period)` 那列即可。
- **Server action**（`src/app/(app)/brews/advice.ts`）：`askBrewMaster(brewId, { force })`——`requireSession` → 驗證擁有者 → gate 檢查（rating + 5 taste 非 null）→ 非 force 時先回快取 → 檢查並佔用每日額度 → 撈 bean + 同豆歷史 → `generateText` → 寫入 `brew_advice` → 回傳。
- **頁面**：brew 詳情（server component）直接查快取 advice、gate 狀態、剩餘額度，傳給 client `BrewMaster` 元件（按鈕 / pending / error / 顯示建議 / regenerate）。
- 動工前先讀 `node_modules/next/dist/docs/` 對應章節（Server Actions）——已讀 `01-getting-started/07-mutating-data.md`。
- commit 前先詢問使用者。

## History

- **Phase 8 — AI Brew Master（詢問 AI 沖煮導師）** — 2026-07-06 完成。Brew 詳情頁在評分＋五項 TasteScale 填完後新增「Ask the Brew Master」區塊；`askBrewMaster` server action 彙整沖煮參數、豆子背景（含 `flavor_notes`）與同豆歷史沖煮，交給 `gemini-3.5-flash`（`generateText`, `thinkingLevel: "minimal"`）產生沖煮建議，跟隨 taster notes 語言（fallback `Accept-Language`）；建議存 `brew_advice`（按 brewId 快取，編輯 brew 時失效）；`brew_advice_usage` 每人每月 10 次上限，並將豆袋掃描額度同步由每日 20 次改為每月 10 次（欄位 `day` → `period`）。
- **Phase 7 — AI 智慧填單（拍豆袋照片自動建豆）** — 2026-07-06 完成。`/beans/new` 掃描豆袋照片 → `gemini-3.5-flash`（`generateObject` + nullable schema、`thinkingLevel: "low"`）辨識 → 預填表單（human in the loop，照片不落地）；client canvas 壓縮、iPhone 上傳／桌面拖拉、`bean_scan_usage` 每日 20 次上限＋剩餘額度顯示。
- **咖啡沖煮筆記網站（Coffee Brew Journal）** — 2026-07-05 完成，squash-merge 至 main（`77dc0d1`）。Phase 1–6 全數完成：editorial design 風格系統、Better Auth 會員、Beans/Brews CRUD（動態欄位、比例計算、TasteScale）、公開個人頁 `/u/[username]` 與 `/explore`、篩選／空狀態／375px 實測／build 通過。
