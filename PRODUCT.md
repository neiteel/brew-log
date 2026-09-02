# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

主要使用者是**認真的家庭沖煮者**：有電子秤與磨豆機，會為了下一杯調整參數，在意粉水比、水溫、研磨刻度與沖煮時間。折射計（TDS／萃取率）是偶爾使用的進階欄位，不是入門門檻——欄位設計上幾乎全部選填，正好對應這種「想記多細就記多細」的人。

次要對象是 Explore 公開動態的瀏覽者與社群成員：讀別人的配方、給 1–5 星評分，可能因此註冊。公開個人頁 `/u/[username]` 服務的也是這條路徑。

## Product Purpose

記錄每一包豆子與每一次沖煮，讓下一杯比上一杯更好。成功的定義是：使用者能靠這份紀錄**重現**一杯好咖啡，或明確知道**下次要改什麼**。

三個構成要件：完整的沖煮參數與五軸風味紀錄、AI 沖煮導師針對單筆沖煮給出的具體調整建議、以及把值得分享的配方公開到社群。

## Positioning

多數沖煮紀錄 App 停在「記下來」。Brew Log 把完整參數 + 五軸風味檔案餵給 AI 導師，產出的是「下一杯改什麼」的具體動作，而不是統計圖表；建議快取在該筆沖煮上，重看不會重複計費。加上 AI 拍豆袋自動建豆（省掉最痛的輸入環節）與公開評分社群，形成「輸入夠輕 → 建議夠具體 → 值得分享」的閉環。

## Operating Context

- 記錄時機在沖煮當下或喝完後幾分鐘內，地點是家中的沖煮台／廚房。
- 資料以「豆子」為單位長期累積，「沖煮」掛在豆子底下——同一包豆會被反覆調參數沖多次，這是核心使用節奏。
- AI 拍豆袋掃描發生在開新的一包豆時，一次性、低頻。
- 社群面是被動瀏覽為主（Explore 列表、公開個人頁），不是即時互動場域。

## Capabilities and Constraints

**已確立的功能**：Beans／Brews 完整 CRUD；AI 拍豆袋自動填單（Gemini）；AI Brew Master 單筆沖煮建議（快取於 `brew_advice`）；公開／私人切換與 Explore 動態；`/u/[username]` 公開個人頁；社群 1–5 星評分；Better Auth（Email 密碼、Google、Email 驗證、忘記／修改密碼）；en / zh-Hant 語言切換；一鍵匯出沖煮資料。

**額度與防濫用**（皆為成本天花板，非付費分級）：
- 每人 10 包豆、50 筆沖煮（`src/lib/limits.ts`），僅在 create server action 把關，seed 可超過。
- AI 功能需 `emailVerified`；拍豆袋與 Brew Master 各有每人每月計數表。
- 註冊同 IP 每小時 ≤ 5，經 Better Auth rateLimit + Upstash Redis secondary storage，跨 serverless 實例有效。
- 列表全面分頁。

**技術前提**：Next.js 16 App Router（server components + server actions）、Neon Postgres + Drizzle、Better Auth、Vercel AI SDK + Gemini、Resend、Upstash Redis、Tailwind v4 + Base UI，部署於 Vercel。

**術語**：豆子(beans)／沖煮(brews)、粉量 dose、粉水比 ratio、TDS、萃取率 extraction yield、五軸風味（香氣／甜感／酸質／苦味／醇厚度，各 0–10）、自評 rating 1–10（與社群評分的 1–5 星是兩套不同尺度，不可混用）。

**明確未決定，不得替使用者決定**：
- 付費分級：roadmap 提過（build-plan #18），但**尚未承諾**。現階段所有上限一律是防濫用，不得在介面上包裝成升級誘因。
- 行動裝置與桌機的實際使用比重未量測（歷史紀錄僅確認 375px 可用）。
- 未確立產品專屬的無障礙標準或已知使用者需求。

**上線前的既有限制**：Resend 寄件網域尚未驗證，`onboarding@resend.dev` 只能寄給帳號本人；Gemini production 需另建免費層 key。

## Brand Commitments

- 名稱 **Brew Log**（metadata 標題為 `Brew.log`，`%s — Brew.log`），icon 為 `src/app/icon.svg`。
- **現有 editorial 視覺系統即是品牌身分**（使用者明確確認為固定前提）：近乎單色的 oklch 灰階、Inter Tight、以排版與分隔線建立層級、幾乎不用卡片與陰影。type scale 與 radius 的單一來源在 `src/app/globals.css`。
- **繁體中文與英文同等級**（使用者明確確認）：zh-Hant 不是附加語言，任何介面在兩種語言下都必須成立，包含字重、行高與斷行。
- **零成本營運**（使用者明確確認）：只用免費層服務，新功能不得引入付費依賴。

## Evidence on Hand

- 可實際運行的完整 App，含 seed 與 bulk seed 腳本（`pnpm db:seed` / `db:seed:bulk`）。
- `README.md` 與 `README.zh-Hant.md`：功能、技術棧、環境設定的現有真實文件。
- `plans/history/` 20 份 feature 紀錄，是每項功能的決策依據。

**目前不存在，未來工作不得捏造**：真實使用者見證、客戶名單、下載或使用者數字、定價、效能基準、獎項或媒體報導。Explore 上的公開沖煮目前來自開發與 seed 資料，不得當成社群規模的證據呈現。

## Product Principles

1. **產品真實需求優先於技術展示。** 這個專案同時是作品集，但兩者衝突時以沖煮者的任務為準；stack 的說服力來自 App 好用，不來自介面上寫著用了什麼。
2. **輸入成本決定產品存亡。** 欄位選填是刻意的：記三個欄位也該是一筆有效紀錄，完整度是漸進的獎勵而非門檻。
3. **額度是天花板，不是誘餌。** 上限與 AI 次數限制存在的理由是成本，介面上以事實陳述呈現，在付費分級真正被決定之前不得暗示升級。
4. **兩種語言都是母語。** 每個新介面在 en 與 zh-Hant 下都要通過同一套排版標準。
5. **AI 給的是下一步動作。** AI 的產出必須是可執行的沖煮調整，不是摘要或評語。
