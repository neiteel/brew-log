<div align="center">

<img src="src/app/icon.svg" alt="Brew Log" width="72" height="72" />

# Brew Log

一款咖啡沖煮筆記網站，幫你調校手沖、義式與各種沖煮方式——記錄你的咖啡豆與每一次沖煮，讓 AI 沖煮導師分析你的上一杯，並把最滿意的配方分享到社群。

[English](README.md) · **繁體中文**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)
![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F)
![Postgres](https://img.shields.io/badge/Neon-Postgres-336791?logo=postgresql&logoColor=white)
![Upstash](https://img.shields.io/badge/Upstash-Redis-00E9A3?logo=upstash&logoColor=white)

</div>

## 專案簡介

Brew Log 是一款為咖啡愛好者打造的全端網站，讓你更有系統地沖煮咖啡。記錄每一包豆子與每一次沖煮——研磨、粉量、水量、水溫、時間、TDS、萃取率，以及完整的風味輪廓——再讓 AI 沖煮導師讀你的筆記，告訴你下一杯該調整什麼。把沖煮設為公開，就能分享到社群動態，讓其他成員評分。

它同時也是一份現代 Next.js App Router 技術棧的參考實作：從頭到尾採用 server components 與 server actions、以 Better Auth 處理身分驗證、Drizzle + Neon 作為資料庫、Vercel AI SDK 提供 AI 功能，並以 Tailwind 與 Base UI 打造的 editorial 設計系統。

## 功能特色

- **咖啡豆與沖煮**——完整的豆單與沖煮筆記 CRUD，包含詳盡的數據（粉量、粉水比、水溫、時間、TDS、萃取率）與五軸風味輪廓。
- **AI 智慧掃描豆袋**——拍下豆袋照片，Gemini 自動填入烘豆商、產地、處理法、烘焙度與風味描述。
- **AI 沖煮導師**——請 AI 教練分析任一次沖煮，針對下一杯給出具體調整建議；建議會依沖煮快取，重複檢視不會再次計費。
- **社群與分享**——把沖煮發佈到 Explore 動態、瀏覽 `/u/[username]` 公開檔案頁，並為其他成員的沖煮給 1～5 顆星評分。
- **身分驗證**——透過 Better Auth 支援 Email／密碼與 Google 登入，含 Email 驗證、忘記／重設密碼、修改密碼流程。
- **多語系**——內建英文與繁體中文（`zh-Hant`），可在設定中依使用者切換。
- **防濫用機制**——以每位使用者的資料上限與每月 AI 用量計數器控管 token 花費，列表全面支援分頁。AI 功能要求信箱已驗證，註冊則由 Better Auth 搭配 Upstash Redis 依 IP 限流——計數在多個 serverless 實例與冷啟動間共享，不再隨每次呼叫重置。

## 技術棧

| 領域     | 技術                                                |
| -------- | --------------------------------------------------- |
| 框架     | Next.js 16（App Router）、React 19、TypeScript      |
| 資料庫   | Neon Postgres + Drizzle ORM                         |
| 身分驗證 | Better Auth（Email／密碼、Google、username plugin） |
| AI       | Vercel AI SDK + Google Gemini                       |
| 郵件     | Resend                                              |
| 限流     | Upstash Redis（Better Auth secondary storage）      |
| 樣式     | Tailwind CSS v4、Base UI                            |
| 部署     | Vercel                                              |

## 開始使用

### 事前準備

- Node.js 20+ 與 [pnpm](https://pnpm.io)
- 一個 [Neon](https://neon.tech) Postgres 資料庫（或任何 Postgres 連線字串）
- 你想啟用之服務的 API 金鑰（Google AI、Google OAuth、Resend）

### 設定步驟

1. 安裝相依套件：

   ```bash
   pnpm install
   ```

2. 在專案根目錄建立 `.env` 檔：

   ```bash
   # 資料庫
   DATABASE_URL="postgresql://..."

   # Better Auth
   BETTER_AUTH_SECRET="一段夠長的隨機字串"
   BETTER_AUTH_URL="http://localhost:3000"

   # Google OAuth（選用——啟用「使用 Google 登入」）
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."

   # Google Gemini（選用——啟用 AI 掃描豆袋與沖煮導師）
   GOOGLE_GENERATIVE_AI_API_KEY="..."

   # Resend（選用——啟用驗證信與重設密碼信）
   RESEND_API_KEY="..."
   EMAIL_FROM="onboarding@resend.dev"

   # Upstash Redis（選用——跨實例共享的身分驗證限流儲存）
   UPSTASH_REDIS_REST_URL="..."
   UPSTASH_REDIS_REST_TOKEN="..."
   ```

3. 將 schema 推送到資料庫：

   ```bash
   pnpm db:push
   ```

4. （選用）灌入範例資料：

   ```bash
   pnpm db:seed
   ```

5. 啟動開發伺服器：

   ```bash
   pnpm dev
   ```

開啟 [http://localhost:3000](http://localhost:3000) 即可看到成果。

> [!NOTE]
> AI、Google 登入與郵件功能皆為選用。沒有這些金鑰 App 一樣能跑，只是在你提供金鑰前，這幾個特定流程無法使用。

> [!WARNING]
> 使用預設寄件者 `onboarding@resend.dev` 時，Resend 只能寄信到你自己的帳號信箱。若要寄給真正的使用者，請先在 Resend 驗證自有網域，並對應修改 `EMAIL_FROM`。

## 指令一覽

```bash
pnpm dev            # 啟動開發伺服器
pnpm build          # 建置正式版
pnpm start          # 啟動正式伺服器（需先 build）
pnpm lint           # 執行 ESLint

pnpm db:push        # 將 schema 變更直接同步到資料庫（開發用）
pnpm db:generate    # 依 schema 變更產生 SQL migration 檔
pnpm db:migrate     # 套用已產生的 migration
pnpm db:studio      # 開啟 Drizzle Studio 瀏覽資料
pnpm db:seed        # 灌入範例資料
```

## 專案結構

```
src/
├── app/
│   ├── (app)/          # 已登入的 App——beans、brews、explore、journal、settings
│   ├── (auth)/         # 登入、註冊、忘記／重設密碼
│   └── api/auth/       # Better Auth route handler
├── components/         # 共用 UI（editorial 設計系統）
└── lib/
    ├── auth.ts         # Better Auth 設定
    ├── db/             # Drizzle schema、client 與 seed
    ├── i18n/           # 語系設定與訊息字典（en、zh-Hant）
    ├── redis.ts        # Upstash Redis client（身分驗證限流儲存）
    └── ...             # 評分、上限、郵件、格式化等 helper
```

## 部署

本 App 設計為部署於 [Vercel](https://vercel.com)。在專案設定中填入上述環境變數，將 `DATABASE_URL` 指向正式的 Neon 資料庫，並把 `BETTER_AUTH_URL` 設為正式網址。若要啟用 Google 登入，記得在 Google Cloud 主控台補上正式的 redirect URI。
