# 22. Fix 靜默資料 bug（水量消失、風味 0 分、刻度 0 不可輸入）

> 完成於 2026-09-02，分支 `fix/silent-data-bugs`。對應 build-plan 未修缺陷 **A** 全部 ＋ **C 的第一項**（0 無法輸入）。

## 做了什麼

三個會靜默弄髒資料的 bug：切換沖煮方式會把已填的 Water/Yield/TDS 洗成 null、未填的風味軸在詳情頁顯示成 0 分、風味刻度輸入不了 0。

## 關鍵檔案

- `src/app/(app)/brews/brew-form.tsx` — Water / Yield / TDS / Extraction 四個欄位改成**一律掛載**，不相干的那側只加 `hidden`（display:none）。原本是 `espresso ? <Yield/> : <Water/>` 的條件渲染
- `src/app/(app)/brews/[id]/page.tsx` — 拿掉傳給 `TasteScale` 的 `?? 0`，直接把可能是 null 的欄位交出去
- `src/components/taste-scale.tsx` — `TasteProfile` 五軸改 `number | null`；null 印 `—` 且長條全空。順手刪掉掛在 `<p>` 上的 `aria-label`（`<p>` 不支援命名，輔助科技本來就會丟棄；可見文字本身已是「標籤＋數值」）
- `src/components/scale-input.tsx` — 刻度從 10 段變 11 段：segment 0 是最前面一個較窄、用 `mr-1` 隔開的標記，不佔計數，所以 7 分仍然是七格填滿
- `DESIGN.md` — Segmented Scale（signature component）章節補上 0 標記的存在理由與視覺規則

## 決策與備註

- **根因不在 `isEspresso()`**（`format.ts:22` 的 `/espresso/i` 在詳情頁與 advice 都是對的），而在拿它去驅動**輸入欄位的掛載**：卸載的 input 不送出 → `optionalNumber`（`actions.ts:29-35`）把 undefined 當「未提供」→ null → `updateBrew` 的 `.set()` 整包覆寫。打自訂方法時字串一含 "espresso" 還會在打字途中抽換欄位。所以修點在表單，沒動 `isEspresso` 也沒動 zod schema
- 沒走 plan 原本寫的「有值才輸出 `<input type="hidden">`」，改用 `hidden` class：程式碼更短，且空欄位仍送空字串 → null，不會替 espresso 憑空生出 waterG（實測確認 `brew_weight_g` 仍 null）。display:none 的元素也不進 tab 順序
- **0 vs null 是這次的核心語意**：0 在 0–10 上是合法分數（「完全沒有酸」），與「我沒記」相反。三處都要能分辨——輸入端（可點 0、再點清成 null）、DB（0 / null）、顯示端（`0` / `—`）
- **DB 盤點**：全表 3 筆 brews，所有可疑條件（espresso 缺 `brew_weight_g`、非 espresso 缺 `water_g`、跨側殘留、風味軸存 0）**都是 0 筆**，既有資料乾淨，沒有人工修的必要。bulk seed 的大量資料目前不在庫裡，之後若再灌要重跑一次盤點
- **驗證方式**：`pnpm lint`、`pnpm build` 通過；用專案既有的 devDependency `puppeteer` 寫一次性腳本跑端到端實測（跑完刪除，登入靠 dev 版 `/login` 的 server-side 預填，帳密沒進過任何檔案）。涵蓋：切方式保值、編輯存檔後 DB `water_g` 仍在且沒生出 `brew_weight_g`、刻度 0 存成 0 且詳情頁印 `0`、再點掉回 null 印 `—`。測試用的那筆 brew 已刪除。選 puppeteer 而非 Playwright MCP 是因為半數斷言在 DB，一個腳本可以瀏覽器＋DB 一次跑完
- **不在本次範圍**：C 剩下的鍵盤與語意問題（六軸 66 個 tab stop、無方向鍵、無群組語意、換成原生 `<input type="range">` 或 Base UI `RadioGroup`）留給 `/impeccable harden`，換實作時要同步更新 `DESIGN.md` 的 Components 章節
