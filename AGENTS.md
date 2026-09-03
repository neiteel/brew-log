<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

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

All feature/fix work goes through the `/feature` skill — invoke it proactively even when the user phrases things conversationally (wants to build something → `load`; ready to implement → `start`; seems done → `review` then `complete`). The skill owns the process details.

State lives in `plans/` (`build-plan.md` roadmap → `current-feature.md` in progress → `history/` archive), not in the chat. After a context clear, read `plans/current-feature.md` and resume from the first unchecked build step.

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
