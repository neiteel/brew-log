# Phase 10 — 修改密碼（Change Password，登入中）

2026-07-06 完成。Settings 頁 Profile 與 Session 之間新增「Password」section；`change-password-form.tsx`（client）用 `authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })`，client 端驗新密碼＝確認、`minLength={8}`，成功後 `form.reset()` 並顯示「已更新、其他裝置已登出」。與 Phase 9（登出救援）互補；A 案假設每人都有密碼。**待辦**：Google 登入上線後須改條件式 UI（已於 Phase 11 完成）。`pnpm build` 通過。
