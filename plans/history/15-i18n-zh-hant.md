# Phase 15 — i18n 繁中（en / zh-Hant）

2026-07-06 完成。讓繁中使用者看懂欄位／評分項目在填/評什麼；只翻 app 寫死的固定 UI，使用者輸入內容與 enum 值不翻。**刻意偏離官方 `[lang]` 路由做法**（使用者不要 URL 切換，已讀 `node_modules/next/dist/docs/.../internationalization.md`），改用「偏好存 DB + server 讀 locale 傳字典」。① `src/lib/i18n/`：`config.ts`（`LOCALES`=en/zh-Hant、`Locale`、`hasLocale`、`toLocale`、`LOCALE_NAMES`、`fill` 代入 `{token}`；純模組供 client import）、`messages/en.ts`（真值來源，`Widen<>` 讓他語系只需對齊 key）、`messages/zh-hant.ts`（檔名須 kebab-case，locale 代碼仍為 `zh-Hant`）、`index.ts`（`import "server-only"` + `getDictionary`）。② 偏好：`auth-schema.ts` user 加 `locale`（`.default("en").notNull()`）、`auth.ts` `user.additionalFields.locale`（input 不關，供 updateUser）、`auth-client.ts` 加 `inferAdditionalFields<typeof auth>()` 才有型別、`pnpm db:push` 已同步。③ Settings 新增「Language」區塊，`language-form.tsx` 用既有 `RadioField`（English / 繁體中文，名稱↔locale 對應）optimistic + `authClient.updateUser({ locale })` + `router.refresh()`。④ 翻譯範圍：brew 詳情頁（kicker、Public/Private、Bean/Recipe/Taste/Community 標題與所有 Row 標籤、View/Edit）、bean 詳情頁（同理 + Brews 空狀態）、brew/bean 表單全部欄位標籤/區塊/hint/按鈕/即時粉水比、new/edit 頁 header 與上限文案、刪除鈕與 confirm；TasteScale 收 `labels`、StarRating 收 `dict.community`。⑤ **序列化準則**（依 vercel-react-best-practices）：server component 直接 `getDictionary` 零序列化；client 只收所需切片（表單收 `form`/`taste`、StarRating 收 `community`、刪除鈕收字串），**不加全域 provider**（會把整本字典送上每條路由，違反 `server-serialization`）。`pnpm build`、`pnpm lint` 皆通過。

## 為什麼不做 `[lang]` 路由（2026-09-03 補記）

原本這裡只寫「使用者不要 URL 切換」，理由記得太薄，後來自己也忘了。真正撐得住的論證是**內容的性質**：

本站只翻介面 chrome，**不翻使用者寫的內容**。公開的 brew / bean / `u/[username]` 頁上會被搜尋到的實質文字——豆名、烘豆商、產區、品種、風味描述、品飲筆記、磨豆機與刻度——全是使用者自己輸入的，兩個語系變體**逐字相同**；隨語系變的只有欄位標籤、沖煮方式與烘焙度的 label、日期格式、區塊標題。

所以 `/en/brews/xyz` 與 `/zh-Hant/brews/xyz` 會是兩個約九成雷同的 URL。這正是 hreflang 存在的情境，但收益趨近於零——讓人搜到那頁的字在兩份裡是同一份。等於用重複內容與爬取預算，換一組不帶來新流量的 URL。成本是全站路由重構加每頁兩份 URL，收益接近零。

**唯一例外是 landing 頁**：`/` 是全站唯一「實質內容本身就是翻譯過的」頁面（標語與產品說明）。哪天真要中文搜尋流量，那是**一個 URL**，單獨開一支 `/zh-Hant` landing route 就好，不需要整套 `[lang]`。

推論的另一面：不要因此以為「繁中內容對搜尋引擎不存在」——不存在的只有 chrome，而 chrome 本來就不是被搜尋的東西。

