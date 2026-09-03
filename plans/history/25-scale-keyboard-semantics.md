# 25. 風味刻度的鍵盤與語意

> 完成於 2026-09-03，分支 `fix/scale-keyboard-semantics`。對應 build-plan 未修缺陷 **C** 的剩餘項目（觸控高度與 0 刻度已在 [22](22-fix-silent-data-bugs.md) 修掉）。走 `/impeccable harden`。

## 做了什麼

六個風味刻度輸入從「十一顆 `aria-pressed` toggle button」換成**一個原生 radio group**。鍵盤成本從每軸 11 站降到 1 站，輔助科技拿到真正的群組語意，順手拔掉一段寫死英文的 `aria-label` 模板。

## 關鍵檔案

- `src/components/scale-input.tsx` — 主要改動。`<button aria-pressed>` → `<label><input type="radio" class="peer sr-only">＋<span> 色條</span></label>`，外面包 `role="radiogroup" aria-label={label}`
- `src/app/(app)/brews/brew-form.tsx` — 「風味」區塊上方加一行 hint（`taste.scaleHint`），距首列 16px
- `src/lib/i18n/messages/{en,zh-hant}.ts` — 新增 `taste.scaleHint`
- `DESIGN.md`、`.impeccable/design.json` — Segmented Scale（signature component）章節同步：新增 input 形態的完整描述與 **The Scale Is A Radio Group Rule**

## 決策與備註

- **沒走 plan 原本寫的兩條路。** `<input type="range">` 表達不了「未記錄」（`aria-valuenow` 是必填），而且它的子元素不能同時是可點的分段；Base UI `RadioGroup` 要自己接 roving tabindex 與樣式，換來的東西原生 radio 本來就有。原生 radio 是更低的一階：**沒有 keydown map、沒有 roving tabindex、沒有 hidden input**，全部由瀏覽器提供
- **i18n 是真 bug，不只是體感問題。** 舊的 `` aria-label={`${label} ${segment} of ${SCALE_MAX}`} `` 是寫死的英文句型，zh-Hant 讀者聽到的是「酸度 7 of 10」——違反 PRODUCT.md「兩種語言都是母語」。修法是**刪掉模板**：群組名由 `aria-label={label}` 帶（字典字串），每顆 radio 的名字就是裸數字，沒有黏合詞就沒有語言
- **群組名用 `aria-label` 而非 `aria-labelledby`。** 可見標籤是 `(Acidity)`，括號是給眼睛的裝飾；語音輸入使用者會說 "Acidity"，不會說 "open paren Acidity"
- **表單值改由 radio 自己帶，hidden input 刪掉。** 未評分的軸整個 key 不送出 → `Object.fromEntries(formData)` 給 undefined → `optionalNumber`（`actions.ts:29-35`）本來就把 `value == null` 當「未提供」→ null。**server 零改動**，實測 `FormData` 只含已評分的軸
- **Space 清不掉，這是實測翻掉的假設。** 原以為已勾選的 radio 按 Space 會照樣送 `click`（滑鼠點已選刻度就是這樣清除的），Chromium 實測不會。所以在 group 上補 `onKeyDown` 接 Backspace / Delete；否則鍵盤使用者一旦誤填選填欄位就再也回不到「未記錄」。文案也照這個事實寫
- **清除動作要講出來。** 色條唯一表達不出來的就是「怎麼清掉」，而六軸清法相同 → 只在區塊上方講一次，不是六行重複 hint，也沒有接 `aria-describedby`（六次重複朗讀比不接更糟）
- **右側數字加 `aria-hidden`。** 破折號念出來沒有意義，「沒有 checked 的 radio」本身就是「未記錄」，radiogroup 才是可及性上的真相來源
- **0 標記命中區補到 24×24**（可見色條仍是 16px，`mx-auto` 置中）。它是整列最窄、最難點的目標，卻是唯一還沒過 24×24 底線的一格
- **驗證方式**：臨時路由 + Playwright 實跑（跑完刪除）。Tab 直接落在已選的 7 → ArrowLeft 變 6（state／填色／數字三者同步）→ Backspace 清空且焦點留在原地 → ArrowRight 從清空狀態選到 8；滑鼠點已選刻度也能清空；a11y tree 是 `radiogroup "Acidity"` → `radio "7" [checked]`；focus ring 實測 `2px solid #0a0a0a` offset 2px；桌機與 375px 各截一次。`tsc --noEmit`、`eslint`、`prettier` 通過。**沒有登入**（不知道 `test@example.com` 密碼，也不想憑空在 DB 建帳號），所以 brew-form 的 hint 只驗到程式碼層，沒有實際渲染截圖
- **已知未解、留在 C 之外**：375px 下計數刻度約 13px 寬，仍低於 24×24。十一個目標放不進手機寬度是這個刻度形態的先天限制，方向鍵只救得了桌機；要修得改形態，不屬於 harden
- **順手發現但沒動**：`scale-input.tsx` 用 `Paren` 當表單標籤，與 `DESIGN.md` 自己的 "Don't use gray parentheses as a form label" 相衝突。那是整個風味區塊的視覺決定，不是鍵盤或語意問題
- **`star-rating.tsx` 沒碰**：同樣是 `aria-pressed` toggle 那套，但它只有 5 站、有明確的 Clear 按鈕、`aria-label` 也走字典，沒有 C 描述的任何一個症狀
