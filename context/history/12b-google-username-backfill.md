# Phase 12b — Google 使用者 username 補齊

2026-07-06。實測發現 Google 註冊者沒有 username → 公開頁 `/u/[username]` 失效。`auth.ts` 加 `databaseHooks.user.create.before`：建立時若無 username，就從 email local-part 產生合法且唯一的 username（`generateUniqueUsername`，符合 3–30 字、`[a-z0-9_.]`，衝突加隨機尾碼），同時填 `displayUsername`。使用者仍可在 Settings 改。**注意**：此 hook 只對「之後新建」的使用者生效；先前已建立的 Google 帳號（username 為 null）需自行到 Settings 設一個。
