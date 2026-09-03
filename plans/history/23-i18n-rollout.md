# Phase 17 — i18n 後續鋪設（把剩下的固定 UI 接進字典）

2026-09-03 完成，`feature/i18n-rollout`。延續 feature 15 的架構（server 直接
`getDictionary`、client 只收切片、不加 provider），把全站剩下的固定 UI 接進字典。
52 個檔案、+1350/-516。

## 三個偏離原計畫的決定

**① 訪客語系後備（Accept-Language）** — 計畫外，做到一半才發現的洞。登出時沒有
session，`getDictionary` 一律落回英文，等於 landing 與四張 auth 頁翻了也永遠不會被
看到。新增 `getLocale()`（`lib/i18n/index.ts`，`React.cache`）：有 session 用
`session.user.locale`，否則解析 `Accept-Language`。**已登入者永遠以 DB 的 locale 為
準，表頭只服務訪客。** 比對用 `Intl.Locale.maximize()` 而不是官方指南建議的
`@formatjs/intl-localematcher` + `negotiator`：lookup 語意會把 `zh-TW` 逐段截斷成
`zh`，而 `zh` 不等於 `zh-Hant`，得把 `zh-TW`/`zh-HK`/`zh-MO` 一個個列進支援清單；
`maximize()` 一步到位，還省掉兩個依賴。實測 `zh-TW`/`zh-HK` → `zh-Hant`、`zh-CN` →
`zh-Hans` 不匹配而往下一個偏好走、`*` 與無表頭 → `en`、`en;q=0.2,zh-HK;q=0.9` 依 q
值選 `zh-Hant`。同時把 `getDictionary()` 改成**不收參數的 async**（自己解析 locale），
8 個呼叫端不再手動傳。

**② 沖煮方式也要做 value/label 拆分** — 載入 spec 時判斷錯了。`options={METHODS}`
其實掛在 `RadioField` 上（受限選項，值會存進 DB），不是自由文字的 datalist。所以除了
Visibility 與 Roast level，沖煮方式也要拆，而且**顯示端**（journal/explore/`u` 的列
標題、兩頁篩選下拉、brew 詳情頁徽章、豆子列的烘焙度）全要查表。

**③ Brew Master 的語言優先序改了** — 原 prompt 是「跟著品飲筆記的語言走，沒筆記才看
Reply language directive」，繁中使用者寫英文筆記照樣拿到英文建議。設定裡選的語言是
明示偏好、筆記語言只是猜測，改成 directive 說了算。實測：英文筆記 + 繁中 locale →
建議是中文。

## 做了什麼

① **`error.tsx`**：全站唯一沒有 server 父層的 client component（error boundary 只收
`error` / `retry`）。用 `useSyncExternalStore` 讀 root layout 已經寫好的
`<html lang>`（server snapshot → client snapshot，不會 hydration mismatch），**五條
字串就地放在檔案裡**——這支包住每一條路由，import 字典等於把兩本字典送上全站。順手把
`unstable_retry` 換成 16.3.0 起已穩定的 `retry`。
② **字典新增區塊**：`nav`、`landing`、`list`、`filters`、`pagination`、`enums`
（`methods`/`roastLevels`/`visibility`）、`brewMaster`、`ai`、`validation`、`titles`、
`auth`、`settings`，`form` 補 `eg*` placeholder 範例。
③ **`label(map, value)`**（`i18n/config.ts`）：查不到就原樣顯示，所以自訂沖煮方式與
舊資料不受影響。`Public`/`Private` 原本散在三處，收斂成 `enums.visibility` 一處。
④ **`formatDate(value, locale)`**：改成每個 locale 一個 `Intl.DateTimeFormat`。
`ListRow` 改成 async server component 自己 `await getLocale()`，省掉 prop drilling。
⑤ **驗證訊息**：`beans/actions.ts`/`brews/actions.ts` 的 zod schema 改成吃字典切片的
factory（`buildBeanSchema(v)` / `buildBrewSchema(v, taste)`），在 action 內建立。用
**整句**而不是拼接片語（語序與量詞逐語言不同），只有六軸風味共用 `{field}` 模板。
⑥ **`metadata`**：12 支靜態 `export const metadata` 改成 `generateMetadata()`，
bean/brew 詳情頁補上 fallback 標題。
⑦ `language-form.tsx` 的 name↔locale 對照表因為 ③ 的 value/label 拆分可以整段刪掉。

## 刻意不做的

- **datalist 建議值與三欄 placeholder**（產地、烘豆商所在地、處理法）維持英文：值會
  存進 DB 並成為 explore 的篩選面向，中文範例會誘導中文輸入，把 `Brazil` 和 `巴西`
  拆成兩個面向。器材品牌名（AeroPress / Kalita Wave / Chemex / Origami / Comandante）
  同理保留。
- **`en` 的日期仍是 `en-GB`**：那不是 bug，是全站英文的英式寫法（`7 Jul 2026`、
  grams、£）。真正的 bug 是它也套在繁中上，已修。
- **Better Auth 回傳的 `error.message`**（登入失敗、username 重複）是 library 產生的
  英文，本輪不碰。

## 驗證

`pnpm lint`、`pnpm build` 皆過；**route table 與 main 逐行相同**（沒有頁面因為讀
headers 從靜態變動態——root layout 讀 session，本來就全是 `ƒ`）。`Widen<typeof en>`
的把關實測過：故意把 `nav.journal` 改名，tsc 立刻在 `zh-hant.ts` 兩處報錯。繁中送出的
`method=Espresso` / `isPublic=Public` / `roastLevel=Light` 寫進 DB 仍是英文，
`?roast=Light` → 2 筆、`?roast=Dark` → 空狀態，篩選未受影響。兩語系走完
journal → new brew/bean → 詳情頁 → settings → explore → `/u/test`，繁中殘留的拉丁
字母只剩使用者資料、保留的品牌名、`TDS`、`JSON` 與自我標示的 `English`。

## 給下一個人

- **加新字串**：先加 `messages/en.ts`（真值來源），tsc 會逼你補 `zh-hant.ts`。
- **client component 拿字串**：從 server 父層傳切片（`t: Messages["auth"]`），不要加
  provider。`error.tsx` 是唯一的例外，理由見上。
- **Server Actions 也能拿字典**：`await getDictionary()` 在 action 裡可用。這是本站
  架構優於官方 `next/root-params` 做法的地方——官方文件明講 root param getter 在
  Server Actions 與 Route Handlers 裡不能用。
- **不要改成 `[lang]` 路由**：理由與唯一的例外（landing 頁）見
  [15-i18n-zh-hant.md](15-i18n-zh-hant.md) 末段。
- **`Vary: Accept-Language` 地雷**：見 build-plan 的上線前提醒區。
- **`AGENTS.md` 的 diff** 是 `next dev` 自己重寫的管理區塊，隨這個 commit 一起進去。
