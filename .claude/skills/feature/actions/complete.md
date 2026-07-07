# Complete Action

1. Run `pnpm lint` — fix any errors before continuing
2. Archive the feature: write a summary (what was built, key files, decisions, gotchas) to `context/history/NN-name.md`, where NN continues the numbering there
3. Check the feature off (`- [x]`) in `context/build-plan.md` with a link to the history file; if it was an ad-hoc feature not on the plan, add it as a checked item in order
4. Reset current-feature.md:
   - Change H1 back to `# Current Feature`
   - Clear Goals, Build Steps, and Notes sections (keep placeholder comments)
5. Stage all changes (code + context files) and commit with a descriptive message — include the spec file from `context/features/` if one was loaded
6. Switch to main and merge the feature branch (no push yet)
7. Delete the local feature branch
8. Push main to origin ONCE (single push with all changes)
9. If feature branch was previously pushed, delete it from origin
