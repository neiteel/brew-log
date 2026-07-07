<div align="center">

<img src="src/app/icon.svg" alt="Brew Log" width="72" height="72" />

# Brew Log

A coffee brewing journal for dialing in your pour-over, espresso, and everything in between — log your beans and brews, get AI coaching on your last cup, and share your best recipes with the community.

**English** · [繁體中文](README.zh-Hant.md)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)
![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F)
![Postgres](https://img.shields.io/badge/Neon-Postgres-336791?logo=postgresql&logoColor=white)
![Upstash](https://img.shields.io/badge/Upstash-Redis-00E9A3?logo=upstash&logoColor=white)

</div>

## Overview

Brew Log is a full-stack web app for coffee enthusiasts who want to brew more deliberately. Record each bag of beans and every brew — grind, dose, water, temperature, time, TDS, extraction yield, and a full taste profile — then let an AI brew master read your notes and tell you what to change next time. Make a brew public to share it on the community feed, where other members can rate it.

It doubles as a reference implementation of a modern Next.js App Router stack: server components and server actions end to end, Better Auth for authentication, Drizzle + Neon for the database, the Vercel AI SDK for AI features, and an editorial design system built on Tailwind and Base UI.

## Features

- **Beans & brews** — Full CRUD for your coffee library and brew log, with detailed metrics (dose, water ratio, temperature, time, TDS, extraction yield) and a five-axis taste profile.
- **AI bean scan** — Photograph a bag and Gemini auto-fills the roaster, origin, process, roast level, and tasting notes.
- **AI brew master** — Ask an AI coach to analyze any brew and suggest concrete adjustments for your next cup; advice is cached per brew so re-viewing never re-bills the model.
- **Community & sharing** — Publish brews to the Explore feed, browse public profiles at `/u/[username]`, and give other members' brews a 1–5 star rating.
- **Authentication** — Email/password and Google sign-in via Better Auth, with email verification, forgot/reset password, and change-password flows.
- **Internationalization** — Ships with English and Traditional Chinese (`zh-Hant`), switchable per user in Settings.
- **Guardrails** — Per-user record caps and monthly AI usage counters keep token spend in check, with paginated lists throughout. AI features require a verified email, and sign-ups are rate-limited per IP via Better Auth backed by Upstash Redis — so limits hold across serverless instances and cold starts instead of resetting per invocation.

## Tech Stack

| Area       | Technology                                            |
| ---------- | ----------------------------------------------------- |
| Framework  | Next.js 16 (App Router), React 19, TypeScript         |
| Database   | Neon Postgres + Drizzle ORM                           |
| Auth       | Better Auth (email/password, Google, username plugin) |
| AI         | Vercel AI SDK + Google Gemini                         |
| Email      | Resend                                                |
| Rate limit | Upstash Redis (Better Auth secondary storage)         |
| Styling    | Tailwind CSS v4, Base UI                              |
| Deployment | Vercel                                                |

## Getting Started

### Prerequisites

- Node.js 20+ and [pnpm](https://pnpm.io)
- A [Neon](https://neon.tech) Postgres database (or any Postgres connection string)
- API keys for the services you want to enable (Google AI, Google OAuth, Resend)

### Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a `.env` file in the project root:

   ```bash
   # Database
   DATABASE_URL="postgresql://..."

   # Better Auth
   BETTER_AUTH_SECRET="a-long-random-string"
   BETTER_AUTH_URL="http://localhost:3000"

   # Google OAuth (optional — enables "Sign in with Google")
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."

   # Google Gemini (optional — enables AI bean scan & brew master)
   GOOGLE_GENERATIVE_AI_API_KEY="..."

   # Resend (optional — enables verification & password-reset emails)
   RESEND_API_KEY="..."
   EMAIL_FROM="onboarding@resend.dev"

   # Upstash Redis (optional — backs auth rate limiting across instances)
   UPSTASH_REDIS_REST_URL="..."
   UPSTASH_REDIS_REST_TOKEN="..."
   ```

3. Push the schema to your database:

   ```bash
   pnpm db:push
   ```

4. (Optional) Seed some sample data:

   ```bash
   pnpm db:seed
   ```

5. Start the development server:

   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the app.

> [!NOTE]
> AI, Google login, and email features are optional. The app runs without their keys — those specific flows are simply unavailable until you provide them.

> [!WARNING]
> With the default `onboarding@resend.dev` sender, Resend can only deliver to your own account email. To email real users, verify a domain in Resend and set `EMAIL_FROM` accordingly.

## Scripts

```bash
pnpm dev            # Start the development server
pnpm build          # Build for production
pnpm start          # Start the production server (requires build first)
pnpm lint           # Run ESLint

pnpm db:push        # Sync schema changes directly to the DB (development)
pnpm db:generate    # Generate SQL migration files from schema changes
pnpm db:migrate     # Apply generated migrations
pnpm db:studio      # Open Drizzle Studio to browse data
pnpm db:seed        # Seed sample data
```

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Authenticated app — beans, brews, explore, journal, settings
│   ├── (auth)/         # Login, signup, forgot/reset password
│   └── api/auth/       # Better Auth route handler
├── components/         # Shared UI (editorial design system)
└── lib/
    ├── auth.ts         # Better Auth configuration
    ├── db/             # Drizzle schema, client, and seeds
    ├── i18n/           # Locale config and message catalogs (en, zh-Hant)
    ├── redis.ts        # Upstash Redis client (auth rate-limit storage)
    └── ...             # Ratings, limits, email, formatting helpers
```

## Deployment

The app is built to deploy on [Vercel](https://vercel.com). Set the environment variables above in your project settings, point `DATABASE_URL` at your production Neon database, and set `BETTER_AUTH_URL` to your production URL. For Google login, add the production redirect URI in the Google Cloud console.
