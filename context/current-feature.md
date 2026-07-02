# Current Feature: 咖啡沖煮筆記網站（Coffee Brew Journal）

## Status

Not Started

## Goals

- 會員系統（Better Auth，email + 密碼）：註冊、登入、登出
- 豆子（Beans）CRUD：烘豆商、產區、處理法、烘焙度、風味描述、杯測分數等欄位
- 沖煮筆記（Brews）CRUD：關聯豆子，記錄沖煮法、器具、研磨度、粉重、水量、水溫、時間、比例（自動計算）、TDS/萃取率（義式）、1–10 評分、五角風味雷達圖（香氣/甜感/酸質/苦味/醇厚度）
- 每篇沖煮筆記可切換公開/私人（預設私人）
- 公開個人頁 `/u/[username]` + 全站探索頁 `/explore`（僅顯示公開筆記，可依沖煮法/產地/烘焙度篩選）
- Editorial design：白底黑字、Inter、極簡、細線分隔、小型大寫標籤（參考 screenshot 截圖的欄位標籤風格）
- Mobile-first：單欄卡片、底部導覽、大點擊區域；桌面版放寬為多欄
- `pnpm build` 通過、手機視窗實測通過

## Notes

### 設計方向

- 字體：Inter（`next/font`），白底黑字，near-black `#111` 文字、灰階層次
- shadcn/ui：由 使用者 執行 init 並設定 design tokens，**Phase 1 完成後先給使用者確認風格再繼續**
- 版面語彙參考截圖：欄位用小型大寫灰色 label + 黑色值、卡片列表、hairline 分隔線
- 風味雷達圖：自繪 SVG 五角雷達（如 screenshot 截圖），react-chartjs-2

### 器具/沖煮法輸入（已決定：預設清單＋可自填）

- 沖煮法 preset：V60、Kalita Wave、Chemex、AeroPress、法壓壺、聰明濾杯、Origami、摩卡壺、義式（Espresso）、冷萃、其它（自填）
- 磨豆機 preset：Comandante、1Zpresso、Timemore、Fellow Ode、Baratza、Mahlkönig、其它（自填）
- 選「義式」時顯示 TDS／萃取率／brew weight 欄位；手沖顯示總水量／注水備註
- DB 以文字儲存 method/grinder 值，preset 僅是 UI 層選項，方便日後篩選統計

### 資料模型（Drizzle + Neon Postgres）

- `user`（Better Auth 產生）+ `username`（公開頁用，唯一）
- `beans`：user_id、roastery、roastery_country、name、origin_country、region、altitude、varietals、process、roast_level、roast_date、flavor_notes、cupping_score、price、weight_g、product_url、more_info、created_at
- `brews`：user_id、bean_id、method、grinder、grind_setting、coffee_g、water_g、temperature_c、time_seconds、brew_weight_g、tds、extraction_yield、rating（1–10）、taste_aroma/sweetness/acidity/bitterness/body（0–5）、notes、is_public（預設 false）、brewed_at、created_at
- 比例（粉水比、粉液比）由欄位即時計算，不落庫

### 頁面（App Router）

- `/` 未登入：極簡 landing + 精選公開筆記；已登入：導向 `/journal`
- `/journal`：自己的筆記，Beans / Brews 兩個 tab（同截圖 Home）
- `/beans/new`、`/beans/[id]`（含該豆所有沖煮記錄列表比較）、`/beans/[id]/edit`
- `/brews/new`（可從豆子頁帶入 bean）、`/brews/[id]`、`/brews/[id]/edit`
- `/u/[username]`：公開個人頁；`/explore`：公開筆記列表＋篩選
- `/login`、`/signup`、`/settings`（username、預設公開偏好）

### 實作階段

1. **Phase 1 — 風格基礎**：shadcn init、Inter、globals.css tokens、AppShell（手機底部導覽/桌面頂欄）、樣式示範頁 → **停下來給使用者確認風格**
2. **Phase 2 — DB + Auth**：安裝 drizzle-orm/drizzle-kit/better-auth，建 schema，接 Neon（需要使用者提供 `DATABASE_URL` 等 env），`db:push`，登入註冊頁
3. **Phase 3 — 豆子 CRUD**（Server Actions + zod 驗證）
4. **Phase 4 — 沖煮筆記 CRUD**：動態欄位（依沖煮法）、比例即時計算、雷達圖輸入/顯示、公開切換
5. **Phase 5 — 公開面**：`/u/[username]`、`/explore`、公開筆記詳情、未登入 landing
6. **Phase 6 — 打磨驗收**：篩選/搜尋、空狀態、`pnpm build`、375px 視窗實測

### 範圍外（v2 候選）

- 照片上傳（Cloudflare R2）、分享圖卡產生（如 screenshot）、注水曲線圖（如screenshot）、收藏/追蹤、Email 通知

### 其他注意

- 此專案的 Next.js 為特殊版本：每個 phase 動工前先讀 `node_modules/next/dist/docs/` 對應章節，遵守 deprecation 提示
- 每個 phase 完成後在瀏覽器驗證；commit 前先詢問使用者

## History
