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

### 未修缺陷（2026-09-02 critique 的殘留）— **全部結案（2026-09-03）**

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

- [x] **C. 風味刻度的鍵盤與語意** → [history/25-scale-keyboard-semantics.md](history/25-scale-keyboard-semantics.md)（2026-09-03，`fix/scale-keyboard-semantics`，走 `/impeccable harden`）
  - ~~`scale-input.tsx:37` 從 1 開始 → **0 無法輸入**~~ **已修**（併進 A，見 history/22）：最前面多一個較窄的 0 標記，不佔計數。
  - ~~`taste-scale.tsx:63` 的 `aria-label` 掛在 `<p>` 上~~ **已刪**（併進 A，見 history/22）。
  - ~~六軸共 **66 個 tab stop**、無方向鍵、無群組語意~~ **已修**：換成一個原生 radio group，每軸 1 站、方向鍵移動即選取、Backspace 清除。
  - **兩條原本指定的路都沒走**：`<input type="range">` 表達不了「未記錄」（`aria-valuenow` 必填），Base UI `RadioGroup` 還要自己接 roving tabindex。原生 `<input type="radio">` 更低一階，keydown map、roving tabindex、hidden input 三樣都不必寫。
  - **順手修掉一個沒被列出的 i18n bug**：舊 `aria-label` 是寫死英文句型，zh-Hant 讀者聽到「酸度 7 of 10」。刪掉模板即解。
  - **實測翻掉的假設**：已勾選的 radio 按 Space **不會**送 `click`，所以滑鼠的「再點一次清除」沒有免費的鍵盤孿生，得自己接 Backspace。
  - `DESIGN.md` 與 `.impeccable/design.json` 的 Segmented Scale 章節已同步（新增 **The Scale Is A Radio Group Rule**）。
  - **未解**：375px 下計數刻度約 13px 寬，仍低於 24×24。十一個目標放不進手機寬度是這個刻度形態的先天限制，要修得改形態。
  - **順手發現沒動**：`scale-input.tsx` 用 `Paren` 當表單標籤，與 `DESIGN.md` 的 "Don't use gray parentheses as a form label" 相衝突——那是視覺決定，不是鍵盤或語意問題。

- [x] **E. 額度文案位置**（2026-09-02，commit `7b599bc`「fix(ui): show the quota only when it is close」，當時漏勾，2026-09-03 補記）
  文案本身完全合規（陳述事實、零升級誘導，符合 PRODUCT.md 原則 3），問題在位置。
  - 走的是「只在超過約 80% 時顯示」那條，不是「移到 Settings」。`src/lib/limits.ts` 新增 `QUOTA_NOTICE_AT = 0.8` 與 `nearQuota()`，把理由寫在 doc comment 裡。
  - **兩個入口都改了**：`brews/new/page.tsx`（40/50 起）與 `beans/new/page.tsx`（8/10 起）——後者本條原本沒點名，但犯的是同一個錯。
  - **文案一字未動**，也沒動 `/impeccable clarify`。
  - Settings 目前完全不顯示紀錄額度（AI 額度也不顯示）。這是刻意的 OR 分支，不是遺漏；哪天想讓使用者隨時查得到用量，再開一條。

- [x] **F. Brew 詳細頁 critique P0+P1** → [history/26-brew-detail-critique-p0-p1.md](history/26-brew-detail-critique-p0-p1.md)（2026-09-03，`fix/brew-detail-critique-p0-p1`，走 `/impeccable critique` → `/feature`。23/40 → 28/40）
  空區塊標題、recipe grid 量幅、enum 在地化、Brew Master 額度與破壞性覆蓋、社群星等改 native radio group。
  - **順帶修掉一個全站 bug**：`PageHeader` 的 kicker 在 zh-Hant 下 tracking 被 `globals.css` 的 unlayered Han 規則歸零，中文版頁首比英文版少一層階層。新增 `--text-kicker` role 解決，影響全部 10 個 call site。
  - **兩次「修東西時弄壞東西」**，都只有實際操作才會發現：radio 的 `disabled={pending}` 讓方向鍵導覽只能走一步（被 disable 的元素無法持有焦點）；`TextButton` 漏傳 `disabled:no-underline` 讓額度耗盡的 Regenerate 看起來仍可點。
  - **未做（複評新發現，已列在 history）**：recipe grid 孤兒列（`md:grid-cols-4` 套在 3–7 項上）、訪客沒有結尾、`notReady` 死路、ratio 缺灰色單位、有 ratio 時配方區塊沒有 `h2`、`(Bean)` 行沒有 measure。
  - **DESIGN.md line 244 該改**：它說整體評分渲染成十格 bar，但實作用 `Figure`，兩次評估都認為實作比規格好。文件待同步。

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

