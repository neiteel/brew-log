# Start Action

1. Read current-feature.md - verify Goals and Build Steps are populated
2. If empty, error: "Run /feature load first"
3. **Resuming?** If some Build Steps are already checked (`- [x]`), this feature was interrupted (often a cleared context). Check out the existing branch, read `git status`/log to see what's done, and continue from the FIRST unchecked step instead of starting over
4. Set Status to "In Progress"
5. Create and checkout the feature branch: derive name from H1 heading, format as `feature/<kebab-case-name>` (e.g. `feature/add-navbar`)
6. Work through Build Steps in order, one at a time. For each step:
   - Implement just that step
   - Verify its "done when" is actually met (run it, build it, or check in browser)
   - Check the step off (`- [x]`) in current-feature.md so progress survives a context clear
7. TodoWrite may mirror the steps for in-session visibility, but current-feature.md is the source of truth
