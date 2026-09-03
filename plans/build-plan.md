# Build Plan

> 一行一個 feature，按大致順序排。`- [x]` 表示已完成（詳細紀錄在
> `plans/history/NN-name.md`）。`/feature` 不帶 spec 時，預設 spec 下一個
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
- [x] 17. i18n 後續鋪設（全站 chrome、訪客語系後備、日期/enum/驗證訊息在地化）→ [history/23-i18n-rollout.md](history/23-i18n-rollout.md)
- [x] 18. Better Auth `session.cookieCache`（跨 request 省一次 session 儲存層來回）→ [history/24-session-cookie-cache.md](history/24-session-cookie-cache.md)（2026-09-03，`feature/session-cookie-cache`）
  - **本條原本的前提是錯的，已更正**：舊敘述寫「`auth.api.getSession` 每次查 DB」。feature 19 加上 `secondaryStorage` 之後就不成立——`storeSessionInDatabase` 預設 false，session 只存在 Upstash，`findSession` 直接讀 Redis 並回傳 session + user，完全不碰 Postgres。所以省的是**一次 Upstash HTTP round-trip**，不是一次 DB query。實測 1 → 0 次。
  - **原本指定的「i18n 小修（一行）」不必做**：Better Auth 的 `/update-user`、`/change-password`、`/verify-email` 都會自己用更新後的 user 重寫 cookie。兩個 Settings 表單一行未改。
  - **鐵則成立且已實測**：cookie 只服務渲染；額度上限與用量一律讀 DB。`MAX_BREWS_PER_USER` 暫調成 1、cookie 完全不變、0 次 Upstash 下仍擋得住。
  - **失效窗實測 296–306s**（`maxAge: 300`）。`revokeSessionsOnPasswordReset` 從即時變成最多慢 5 分鐘，要縮短改 `maxAge` 一行。
  - **`refreshCache` 不能開**：會拿 cookie 自己的內容重簽 cookie 而不查儲存層，讓活躍 session 無限續命、繞過撤銷。預設 false，且有 `secondaryStorage` 時被強制關閉。
  - **付費分級仍待辦**：tier 放 subscription 表或 user 欄位皆可，但把關的 server action（`createBrew`/`askBrewMaster`/`scanBeanPhoto`）要 fresh 讀 tier（查 DB 或 `getSession({ query: { disableCookieCache: true } })`）；升級 webhook 刷新 cookie 讓方案即時生效。
- [x] 19. AI 濫用防護（AI 功能加 `emailVerified` 把關 + Better Auth `rateLimit` 接 Upstash Redis secondary storage、註冊同 IP 每小時 ≤ 5）→ [history/19-ai-abuse-protection.md](history/19-ai-abuse-protection.md)。上線前置：Resend 網域驗證、Vercel 設 Upstash env（見下方提醒）。
- [x] 20. 一鍵匯出沖煮資料（下載式，不開 API）→ [history/20-export-brew-data.md](history/20-export-brew-data.md)。CSV 加值未做；按鈕文案 i18n 歸 feature 17。
- [x] 21. 參數變成主角（粉水比升為 `text-display`、`?from=` 重複沖煮、豆子頁沖煮列加參數、`generateMetadata`）。

### 未修缺陷（2026-09-02 critique 的殘留）

> **已修（2026-09-02，`/impeccable` 四輪 + 一次補修）**：版面節奏與欄寬、動作按鈕層次、
> 灰字 3.74→**4.88:1**、focus ring 1.36→**19.80:1**、placeholder 1.48→**4.88:1**、
> 承重邊框 1.24→**3.28:1**（新增 `--border-strong`）、風味格觸控高 14→**24px**、
> CJK 字族與排版度量（`:lang(zh-Hant)` 專屬 line-height / tracking）、`<html lang>` 跟隨 locale、
> globals.css 死碼（148→85 行）、`DESIGN.md` + `.impeccable/design.json`。
>
> **這裡不是全部都該用 `/impeccable`。** 它負責的是介面品質，不是業務邏輯。
> 下面每一項都標了實際該走的路徑。

- [x] **A. 兩個靜默資料 bug（最優先，會弄髒 DB）** → [history/22-fix-silent-data-bugs.md](history/22-fix-silent-data-bugs.md)（2026-09-02，`fix/silent-data-bugs`；連同 C 的第一項一起修。DB 盤點結果乾淨，無須人工修）
  這是表單狀態機與資料語意的錯，不是視覺問題；impeccable 不會、也不該碰。
  - `brew-form.tsx:95-96` 用子字串比對從自訂方法欄位推導 `isEspresso`：Water 填了值再切成 Espresso → input 卸載、隱藏欄位不送出 → **值消失**；編輯時 `updateBrew` 的 `.set()`（`actions.ts:193`）把 null 寫進 DB。打自訂方法時字串一含 "espresso" 還會在打字途中抽換欄位。
  - `brews/[id]/page.tsx:231-235` 用 `?? 0` 把未填風味軸渲染成 **0 分**。0 在 0–10 尺度上是合法分數（`schema.ts:69` 驗 `min(0)`），「酸質 0」＝完全沒有酸，是「我沒記」的相反。→ null 時渲染 `—` 並省略長條。（`DESIGN.md` 的 Don'ts 已載入這條原則，但程式碼還沒改。）
  - 修完值得查一次 DB，既有資料可能已被污染。

- [ ] **C. 風味刻度的鍵盤與語意** → **`/impeccable harden`**（觸控高度已修，剩下的是鍵盤與輔助科技）
  - ~~`scale-input.tsx:37` 從 1 開始 → **0 無法輸入**~~ **已修**（併進 A，見 history/22）：最前面多一個較窄的 0 標記，不佔計數。
  - ~~`taste-scale.tsx:63` 的 `aria-label` 掛在 `<p>` 上~~ **已刪**（併進 A，見 history/22）。
  - 六軸共 **66 個 tab stop**（0 標記讓每軸多一個）、無方向鍵、無群組語意。
  - → 換原生 `<input type="range" min="0" max="10">`，或用 `text-input.tsx` 已在用的 Base UI `RadioGroup` 拿 roving tabindex。**注意**：`DESIGN.md` 已把分段刻度列為 signature component，換實作要同步更新它的 Components 章節。

- [ ] **E. 額度文案位置** → **`/impeccable layout`**（是層級問題，不是文案問題）
  文案本身完全合規（陳述事實、零升級誘導，符合 PRODUCT.md 原則 3，**不要改文案**，也不要用 `/impeccable clarify`），但 `brews/new/page.tsx` 把「42 of 50 brews used」放在副標——在使用者正要記錄一杯咖啡時把倒數推到臉上。→ 移到 Settings，或只在超過約 80% 時顯示。

> **修改時不要破壞**：選填語意端到端貫徹（`actions.ts:21-33`）、AI 快取在編輯時正確失效（`actions.ts:203`）、即時衍生粉水比／萃取率（`brew-form.tsx:100-107`）。

> **關於 feature 17（i18n 鋪設）**：不要用 impeccable。它是把字串接進既有字典架構，屬於 `/feature` 的範圍。
> impeccable 只在「排版因為譯文變長而壞掉」時才進場（`/impeccable adapt`）。

## 上線前提醒（非 feature，部署時處理）

- **Google 登入正式上線前**：GCP 補 production redirect URI；Vercel 設 `GOOGLE_CLIENT_ID/SECRET`、`BETTER_AUTH_URL`、`RESEND_API_KEY`。
- **寄件網域**：目前 `onboarding@resend.dev` 只能寄到 Resend 帳號信箱）。要真正寄給任何使用者（驗證信／重設信）必須先在 Resend 驗證自有網域並改 `EMAIL_FROM`。Resend 免費層額度綁帳號（換 key 不會變多）：**3,000 封/月、100 封/日**，網域驗證本身免費，這個量級對本專案綽綽有餘。
- **Gemini API key**：production 用 **AI Studio 免費層 key（不綁信用卡）**——最壞情況是額度用完請求失敗，零金錢風險。目前開發用的 key 不是免費層，上線前另建。
- **公開 repo**：git 歷史已掃過無密鑰（2026-07 確認）。公開 repo （Resend 網域未驗證期間，使用者註冊收不到驗證信）。
- **`Vary: Accept-Language`（feature 17 埋下的地雷，2026-09-03 記）**：訪客語系改由 `Accept-Language` 決定後，同一個 URL 的內容會依表頭變動，但回應的 `Vary` 只有 `rsc, next-router-*, Accept-Encoding`，**沒有 `Accept-Language`**。目前無害——全站 route 都是 `ƒ`，Vercel 不會 CDN 快取。**哪天給公開頁（`/`、`/explore`、`/u/[username]`、公開 brew）加上 `s-maxage` 或 `revalidate`，就要同時補上 `Vary: Accept-Language`**，否則繁中訪客會拿到快取住的英文頁。
- **不要改成 `[lang]` 路由**：理由與唯一的例外（landing 頁）見 [history/15-i18n-zh-hant.md](history/15-i18n-zh-hant.md) 末段。

