import Link from "next/link"
import { redirect } from "next/navigation"

import { desc, eq } from "drizzle-orm"

import { PageShell } from "@/components/page-shell"
import { db } from "@/lib/db"
import { beans, brews, user } from "@/lib/db/schema"
import { formatDate } from "@/lib/format"
import { getSession } from "@/lib/session"

export default async function LandingPage() {
  const session = await getSession()
  if (session) redirect("/journal")

  const featured = await db
    .select({
      id: brews.id,
      method: brews.method,
      rating: brews.rating,
      brewedAt: brews.brewedAt,
      beanName: beans.name,
      username: user.username,
      userName: user.name,
    })
    .from(brews)
    .innerJoin(beans, eq(beans.id, brews.beanId))
    .innerJoin(user, eq(user.id, brews.userId))
    .where(eq(brews.isPublic, true))
    .orderBy(desc(brews.brewedAt))
    .limit(6)

  return (
    <PageShell>
      <header className="space-y-6 md:space-y-8">
        <h1 className="text-h1 font-medium">
          A journal for beans, recipes and tasting notes.
        </h1>
        <p className="text-body text-muted-foreground max-w-sm">
          Log every bean and brew, dial in your recipes, and share what's worth
          sharing.
        </p>
        <div className="text-body flex items-center gap-8">
          <Link
            href="/signup"
            className="hover:text-muted-foreground font-medium underline underline-offset-4"
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>
        </div>
      </header>

      <section className="space-y-8 md:space-y-10">
        <div className="space-y-1">
          <h2 className="text-h2 font-medium">Public brews</h2>
          <p className="text-small text-muted-foreground">
            Latest notes shared by the community.
          </p>
        </div>
        {featured.length === 0 ? (
          <p className="text-body text-muted-foreground">
            No public brews yet — be the first to share one.
          </p>
        ) : (
          <div>
            {featured.map((entry) => (
              <Link
                key={entry.id}
                href={`/brews/${entry.id}`}
                className="group border-border grid grid-cols-[6.5rem_1fr_auto] items-baseline gap-x-3 border-b py-4 md:grid-cols-12 md:gap-x-5"
              >
                <p className="text-small text-muted-foreground md:col-span-2">
                  {formatDate(entry.brewedAt)}
                </p>
                <p className="text-h3 font-medium group-hover:underline group-hover:underline-offset-4 md:col-span-4">
                  {entry.method}{" "}
                  <span className="text-muted-foreground font-normal">
                    — {entry.beanName}
                  </span>
                </p>
                <p className="text-body text-muted-foreground md:col-span-5">
                  {entry.username ?? entry.userName}
                </p>
                <p className="text-body md:col-span-1">
                  {entry.rating != null ? `${entry.rating}/10` : "—"}
                </p>
              </Link>
            ))}
          </div>
        )}
        <div className="text-body">
          <Link
            href="/explore"
            className="hover:text-muted-foreground font-medium underline underline-offset-4"
          >
            Explore all public brews
          </Link>
        </div>
      </section>
    </PageShell>
  )
}
