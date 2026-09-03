# 26. Brew 詳細頁 critique P0+P1

**日期**：2026-09-03
**分支**：`fix/brew-detail-critique-p0-p1`（三個 commit，squash 進 main）
**來源**：`/impeccable critique` 對 `src/app/(app)/brews/[id]/page.tsx`，23/40 → **28/40**
**Critique 快照**：`.impeccable/critique/2026-09-03T04-45-43Z__*.md`（修前）、`2026-09-03T06-07-10Z__*.md`（修後複評）

## 為什麼這輪值得記

偵測器（`detect.mjs`）、ESLint、TypeScript 在動工前後**都是全綠**。這裡修的每一項都是它們抓不到的：要嘛是**條件式渲染出來的空洞**，要嘛是**DESIGN.md 自己寫下、卻只在部分檔案被遵守的具名規則**。把「靜態檢查全綠」當成介面沒問題，是這個專案現階段最大的盲點。

## 修了什麼

### 1. 區塊會在無內容時印出標題（P0）

`page.tsx` 的 Taste `<section>` 無條件輸出 `<h2>`，而 rating / taste / notes / owner 四個內容全部各自有條件。四個都不成立時畫面是 40px 標題 + 約 200px 空白 + 下一個標題。實測 `/brews/6b600eb7-…` 去標籤後**字面上就是 `Taste|Community`**，中間零個字。

DESIGN.md line 178 一字不差點名這個失敗模式（「144px 空隙壓在四個灰字上方⋯⋯是有東西載入失敗」），而這裡是壓在**零個字**上。

改法：`hasFigures` / `hasTasteContent` 兩個 predicate，false 就整段不渲染；owner 拿到一行灰字加編輯連結（`taste.notScoredBefore/Link/After` 三段式，讓 zh-Hant 保有句子控制權）。recipe 區塊套同一個 guard。

### 2. recipe grid 不吃 832px measure（P0，只修了一半）

grid 沒有 max-width，1440px 下攤到 x=1190，而正下方的 taste 列停在 852px——一筆紀錄裡兩條右邊界。套上 `DATA_ROW_MEASURE` 後量測為 `left 20 / right 852`，與六條 taste 列完全同一垂直線。

**根因沒解**：`md:grid-cols-4` 套在**永遠是 3–7 項**的內容上，所以 5 項時第五個 figure 仍會孤零零掉到第二列。複評把這個列為新的 P0。修法是 `grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]`，一個 class。使用者這輪選擇不做。

### 3. enum 只有這頁不在地化（P1）

`explore` / `journal` / `u/[username]` 都用 `label(dict.enums.*)`，這頁只對 `visibility` 用。zh-Hant 讀者在 Explore 點「義式濃縮」進來看到 "Espresso"。

**修這條時暴露出第二個 bug**：zh-Hant 的 `roastSuffix` 是「烘焙」，而 `roastLevels.Dark` 是「深焙」，組起來變成「深焙 烘焙」。根因在兩個 call site 共用的組法，所以 zh-Hant 的 suffix 改成空字串、兩處都 `.trim()`——這同時修好 `beans/[id]/page.tsx:83`，那裡原本對 zh-Hant 讀者顯示「Dark 烘焙」。

### 4. Brew Master 額度與破壞性覆蓋（P1）

`depleted = remaining <= 0 && !advice`：有快取且額度為 0 時 `depleted` 是 false，按鈕以 **enabled** 渲染、標著「重新產生」，緊鄰「本月還剩 0 / 5 次」。唯一可能的結果是伺服器拒絕。

改法：`depleted = remaining <= 0`；Regenerate 降成 `TextButton`（它取代答案而非寫入答案，不是 commit action）並加 `window.confirm`，文案同時陳述兩個代價；生成中舊建議轉灰。另外把 `role="status"` 從 server-rendered 的建議段落拿掉——它會讓快取建議在頁面載入時被當成狀態變更播報。

**額度文案一字未動**，且複評再次確認合規（陳述事實、指明重置、零升級誘導）。

### 5. 社群星等改成 native radio group（P1）

五個 `aria-pressed` button 違反系統自己的 **The Scale Is A Radio Group Rule**。實際後果：評 5 分時第 3 顆星視覺填滿卻宣告「not pressed」——五個控制項有四個對螢幕閱讀器講反話；五個 tab stop；hover 預覽只綁 `onMouseEnter`。

改成 `role="radiogroup"` + 五個 native radio。**沒有用裸 `<fieldset>`**，而是對齊 `scale-input.tsx` 既有的解剖，一致性優於引進第二種寫法。實測：一個 tab stop、方向鍵移動即選取、`aria-pressed` 歸零、hit area 26×26 → 32×33。

## 兩個「修東西時弄壞東西」

這是本輪最該留下的教訓，兩次都是**只有實際操作才會發現**，靜態檢查全綠。

### A. `disabled={pending}` 讓方向鍵導覽只能走一步

改成 radio group 後，實測兩次 ArrowRight 只前進一格，焦點掉到 `<body>`。原因：送出瞬間 radio 被 disable，而**被 disable 的元素無法持有焦點**。這個屬性在改動前就存在，但舊版是不成群組的 button，焦點不需要在按鍵之間存活，所以永遠顯現不出來。

改法：進行中不 disable radio。optimistic 值已反映選擇，後來的選擇只是另一次 upsert。

### B. `TextButton` 的 disabled 底線

把 Regenerate 從 `Button` 改成 `TextButton` 時，漏傳了 `star-rating.tsx` 有傳的 `disabled:no-underline`。於是額度耗盡時——正是控制項失效那一刻——「重新產生」是灰色**帶底線**，看起來仍可點。修一個「可按但注定失敗」，製造了一個「看起來可按但不能按」。

改法：`disabled:no-underline` 移進 `TextButton` base，刪掉區域覆寫。底線就是這個 primitive 的 affordance，該由 base 決定。

## 順帶修掉的全站 bug（複評才發現）

`PageHeader` 用 `text-small tracking-[0.08em]`，而它自己的註解宣稱「uppercase 對 zh-Hant 是 no-op，所以由 tracking 承載標籤讀法」。**沒有承載。**

`globals.css` 的 `:lang(zh-Hant)` 規則**刻意不放進 layer**（註解明說是要贏過 Tailwind utilities layer），而 kicker 用的正是 `.text-small`。控制變因實測：同一元素 `lang="en"` 時 `letter-spacing: 1.04px`，翻成 `zh-Hant` 變 `normal`。中文版頁首因此比英文版少一層階層，而品牌承諾是兩語同等級。**影響全部 10 個 `PageHeader` call site。**

改法：新增 `--text-kicker` role（13px / 1.4 / 0.08em），刻意排除在 Han 的 letter-spacing 重置之外，並給它自己的 `:lang(zh-Hant)` 行高——依 Han Metrics Rule，新 type role 兩個 metric 都要設。這**不是第七個字級**，是同尺寸的角色；DESIGN.md 本來就把 kicker 描述成「label 尺寸配大寫與 0.08em tracking」。

**驗證過程本身是個 gotcha**：第一次量測 `text-kicker` 完全沒生效（computed 16px / normal）。dev server 的 Turbopack **不會在不重啟的情況下撿到新的 `@theme` token**。改用 production build 跑在 port 3100 驗證才確認正確：en kicker `1.04px / 13px / lh 18.2px`，zh-Hant kicker `1.04px / 13px / lh 20.8px`，zh-Hant subtitle `normal / 28px`。如果當時只信任「編輯成功」，會交付一個完全沒作用的修復。

## 決策：DESIGN.md 錯了，不是程式碼

DESIGN.md line 244 說「五條風味軸**與整體評分**都渲染成十格 bar」，但 `page.tsx` 把整體評分渲染成 `Figure`（40px 數字 + 灰 `/10`）。兩次評估都認為**實作比規格好**：大數字給結論、bar 給組成，階層比六條一樣的 bar 清楚，而且拉開了與社群 1–5 星的距離。**該改的是文件**，但不在這條分支做。

## 驗證方式

- `pnpm lint` 0/0、`npx tsc --noEmit` 0 errors、`pnpm build` exit 0
- 登出狀態：1440×900 與 390×844，en 與 zh-Hant，完整與稀疏兩筆沖煮
- owner 與已登入評分者：**建了一個拋棄帳號**實際操作（seed 腳本只找 `test@example.com`，repo 裡沒有密碼）。驗完刪除帳號，豆與沖煮隨 FK cascade 一併消失；寫進 seeded 沖煮的那筆評分已收回，該筆回到 `5.0 / 2 ratings`
- **未驗**：Brew Master 的 depleted / 快取 / 生成中三個狀態需要真的呼叫 Gemini（且需 `emailVerified`），沒有花那個額度

## 複評留下、這輪沒做的

使用者把範圍限定在 P0+P1，複評的新發現只做了 kicker 與 disabled 底線兩項。其餘記在此供下一輪：

- recipe grid 孤兒列（P0，`auto-fit` 一個 class）
- 登出訪客沒有結尾：沒有「登入以評分」、沒有回 Explore、沒有這位沖煮者的其他紀錄（P1）
- Brew Master `notReady` 是死路：不連編輯頁、不說缺哪幾項，而「有評分、五軸填三軸」這個最常見的中間狀態兩條路都走不到（P2）
- ratio 少了 DESIGN.md 指定的灰色 `1:` 單位——系統用來論證自己的那個元素只做到三層階層（P2）
- **有 ratio 時配方區塊完全沒有 `h2`**，標題大綱是 `h1 → h2 風味 → h2 社群評分`。頁面存在的理由在螢幕閱讀器導覽裡不存在。修法：兩個分支都保留 `h2`，有 display ratio 時 `sr-only` 它
- `(Bean)` 事實行沒有 `DATA_ROW_MEASURE`，風味描述長的豆子會拉滿 1476px shell
- Brew Master 虛線面板用滿版 1400px 裝一句話
- `delete-brew-button.tsx:27` 的 `hover:opacity-70` 把 Correction Red 從 4.76:1 拉到約 2.9:1，違反 DESIGN.md 明文的 hover 對比下限
- AI 建議以純文字渲染，但 system prompt 邀請模型用項目符號，條列答案會以字面 `- ` 出貨

## 流程上的一個限制

複評時兩個評估 sub-agent **共用同一個 Playwright 瀏覽器實例**，其中一個觀察到自己的 viewport 與 URL 被另一方改動。分析脈絡是隔離的，瀏覽器層面不是。所有承重的主張都由主 session 獨立覆核過（右邊界量測、kicker 的 computed style A/B、`aria-pressed` 計數、`cn is not defined` 那個 console 噪音——查證為加 import 當下的 Turbopack HMR 暫態，非常駐 bug）。
