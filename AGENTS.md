<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Commands

```bash
pnpm dev        # start development server
pnpm build      # build for production
pnpm start      # start production server (requires build first)
pnpm lint       # run ESLint

# Database (Drizzle + Neon)
pnpm db:push       # sync schema changes directly to DB (use during development)
pnpm db:generate   # generate SQL migration files from schema changes
pnpm db:migrate    # apply generated migrations to the database
pnpm db:studio     # open Drizzle Studio GUI to browse data
```

# Tech Stack

- **Database**: Neon Postgres + Drizzle ORM
- **Auth**: Better Auth
- **File Storage**: Cloudflare R2
- **Email**: Resend
- **AI**: Vercel AI SDK (OpenAI/Anthropic)
- **Cache**: Upstash Redis
- **Deployment**: Vercel

# Workflow

Every feature/fix follows this sequence:

1. **Document** - Document the feature in `context/current-feature.md`
2. **Branch** - Create a new branch (`feature/[name]` or `fix/[name]`)
3. **Implement** - Implement based on the feature doc
4. **Test** - Verify in browser, run `pnpm build` and fix any errors
5. **Iterate** - Make changes as needed
6. **Commit** - Only after build passes (ask before committing)
7. **Review** - Review AI-generated code before merging
8. **Merge** - Squash-merge to main
9. **Delete Branch** - Ask to delete branch after merge
10. **Complete** - Mark as completed in `context/current-feature.md` and add to history

> The `/feature` skill covers Steps 1, 3–7, and 10. Git operations (Steps 2, 6, 8–9) are done separately.

# Branching & Commits

- Branch names: `feature/[feature]` or `fix/[fix]`
- Ask before committing — never auto-commit
- Use conventional commit messages (`feat:`, `fix:`, `chore:`, etc.)
- Keep commits focused (one feature/fix per commit)
- Merge strategy: squash-merge feature branches (`git merge --squash`) so main stays one conventional commit per feature/fix
- Never include "Generated With Claude" in commit messages

# When Stuck

- Stop after 2–3 failed attempts and explain the issue
- Don't keep trying random fixes
- Ask for clarification if requirements are unclear
