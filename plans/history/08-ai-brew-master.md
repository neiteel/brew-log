# Phase 8 — AI Brew Master（詢問 AI 沖煮導師）

2026-07-06 完成。Brew 詳情頁在評分＋五項 TasteScale 填完後新增「Ask the Brew Master」區塊；`askBrewMaster` server action 彙整沖煮參數、豆子背景（含 `flavor_notes`）與同豆歷史沖煮，交給 `gemini-3.5-flash`（`generateText`, `thinkingLevel: "minimal"`）產生沖煮建議，跟隨 taster notes 語言（fallback `Accept-Language`）；建議存 `brew_advice`（按 brewId 快取，編輯 brew 時失效）；`brew_advice_usage` 每人每月 10 次上限，並將豆袋掃描額度同步由每日 20 次改為每月 10 次（欄位 `day` → `period`）。
