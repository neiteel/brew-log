# Current Feature: Phase 7 — AI 智慧填單（拍豆袋照片自動建豆）

## Status

Completed — 2026-07-06

## Summary

`/beans/new` 新增「掃描豆袋照片」入口：上傳／拖拉／拍攝豆袋照片，AI 辨識後自動預填 bean 表單，使用者檢查／修改後才存檔（human in the loop）。照片全程不落地（不進 R2、用完即丟）。

- **模型 / SDK**：Vercel AI SDK（`ai` v7 + `@ai-sdk/google`）＋ `gemini-3.5-flash`；需要 `GOOGLE_GENERATIVE_AI_API_KEY` env。（原定 Anthropic，2026-07-06 改用 Gemini。）
- **辨識**：server action `scanBeanPhoto`（`src/app/(app)/beans/scan.ts`）用 `generateObject` + 全欄位 nullable zod schema；辨識不到的欄位回傳 null（不硬猜）。對應 `beans` schema：name、roastery、roasteryCountry、originCountry、region、altitude、varietals、process、roastLevel、roastDate、flavorNotes、cuppingScore、weightG。
- **thinking level**：`thinkingLevel: "low"`——實測比 default 快約 2.5 倍（6.7s→2.6s），辨識準確度無差異；`minimal` 會臆測未印在標籤上的值，故不用。
- **圖片流程**：client canvas 壓縮（最長邊 ~1568px、JPEG q0.8）→ base64 → server action → 回傳欄位 → remount `BeanForm` 以新 `defaultValue` 預填。單次掃描約 1,000–1,600 image tokens。
- **上傳方式**：`<input accept="image/*">`（不設 `capture`，iPhone 可選相簿或拍照）＋ 桌面拖拉上傳。
- **次數上限**：`bean_scan_usage` 資料表（每人每 UTC 日一列），每日上限 20 次，呼叫模型前先檢查並佔用額度；剩餘額度顯示在掃描區（`getBeanScanQuota` 帶入，掃描後由 action 回傳即時更新）。先用簡單 DB 計數，不引入 Upstash。

## 後續 Phase（本次範圍外）

- **Phase 8 — AI Brew Master**：brew 詳情頁「詢問 AI 導師」（rating + 五項 TasteScale 填完才啟用）；輸入含本次參數、豆子背景（含 flavor_notes 作烘豆商預期風味）、同豆歷史沖煮；建議存 DB 避免重複計費；**不做 AI 生成 Notes**（避免 AI 分析 AI 的循環）。

## 其他注意

- 此專案的 Next.js 為特殊版本：動工前先讀 `node_modules/next/dist/docs/` 對應章節（Server Actions、route handlers），遵守 deprecation 提示。
- commit 前先詢問使用者。

## History

- **Phase 7 — AI 智慧填單（拍豆袋照片自動建豆）** — 2026-07-06 完成。`/beans/new` 掃描豆袋照片 → `gemini-3.5-flash`（`generateObject` + nullable schema、`thinkingLevel: "low"`）辨識 → 預填表單（human in the loop，照片不落地）；client canvas 壓縮、iPhone 上傳／桌面拖拉、`bean_scan_usage` 每日 20 次上限＋剩餘額度顯示。詳見上方 Summary。
- **咖啡沖煮筆記網站（Coffee Brew Journal）** — 2026-07-05 完成，squash-merge 至 main（`77dc0d1`）。Phase 1–6 全數完成：editorial design 風格系統、Better Auth 會員、Beans/Brews CRUD（動態欄位、比例計算、TasteScale）、公開個人頁 `/u/[username]` 與 `/explore`、篩選／空狀態／375px 實測／build 通過。設計細節與資料模型見該次 commit 內的歷史版本文件。
