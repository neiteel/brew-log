import { eq, inArray } from "drizzle-orm"

import { auth } from "@/lib/auth"

import { db } from "./index"
import {
  beans,
  beanScanUsage,
  brewAdvice,
  brewAdviceUsage,
  brewRatings,
  brews,
  user,
} from "./schema"

// Bulk seed for testing pagination, data caps and the community surfaces.
// Generates BULK_BEANS beans and BULK_BREWS brews (defaults 25 / 120) for the
// test account — deliberately above the per-user caps, since it inserts
// directly and bypasses the server actions that enforce them — plus two peer
// accounts with their own beans, brews and star ratings.
//
// Peers exist because half the app is unreachable with one user: `rateBrew`
// rejects your own brew, so a single-account seed leaves every ★ average on
// Explore permanently empty, and /u/[username] has exactly one profile.
//
// Idempotent: clears the seeded users' beans/brews (brews, and their ratings,
// go with the FK cascade) and AI counters first, then re-inserts. Peer logins
// are created once and reused.
//
//   pnpm db:seed:bulk              # the works
//   BULK_QUOTA=1 pnpm db:seed:bulk # …with the AI monthly quotas exhausted
const BEAN_COUNT = Number(process.env.BULK_BEANS) || 25
const BREW_COUNT = Number(process.env.BULK_BREWS) || 120
const PEER_BEANS = 6
const PEER_BREWS = 16

// Peer logins, so you can sign in as someone else and rate the test account's
// brews by hand. Same password for both; they are dev fixtures.
const PEER_PASSWORD = "brewlog-demo-1234"
const PEERS = [
  { email: "peer1@example.com", name: "Mika Lindqvist", username: "mika" },
  { email: "peer2@example.com", name: "Tomás Rivera", username: "tomasr" },
] as const

// Matches MONTHLY_SCAN_LIMIT / MONTHLY_ADVICE_LIMIT (beans/scan.ts,
// brews/advice.ts). Only used to fill the counters to the ceiling.
const AI_MONTHLY_LIMIT = 10

const ROASTERIES = [
  ["Scarlett Coffee Roastery", "United Kingdom"],
  ["Rocket Bean Roastery", "Latvia"],
  ["Fjord Coffee", "Germany"],
  ["Simple Kaffa", "Taiwan"],
  ["Onyx Coffee Lab", "United States"],
  ["La Cabra", "Denmark"],
] as const

const ORIGINS = [
  "Ethiopia",
  "Kenya",
  "Colombia",
  "Brazil",
  "Guatemala",
  "Panama",
  "Indonesia",
] as const

const BEAN_NAMES = [
  "Ibis",
  "Kiambu",
  "Gesha Village",
  "Finca El Paraíso",
  "Yirgacheffe Lot 7",
  "Santa Rosa",
  "Blue Batak",
  "El Vergel",
  "Karogoto AA",
  "Chelbesa",
  "La Palma",
  "Hartmann Estate",
] as const

// The optional half of a bean. Only some rows carry it, so both the fully
// documented bean page and the bare one get exercised.
const BEAN_DETAILS = [
  {
    region: "Sul de Minas",
    altitude: "1,150–1,250 m",
    varietals: "Red Catuaí, Yellow Catuaí",
  },
  { region: "Nyeri", altitude: "1,700–1,900 m", varietals: "SL-28, SL-34" },
  {
    region: "Huila",
    altitude: "1,600–1,800 m",
    varietals: "Caturra, Castillo",
  },
  { region: "Guji", altitude: "1,950–2,100 m", varietals: "Heirloom" },
] as const

const PROCESSES = ["Washed", "Natural", "Honey", "Anaerobic"] as const
const ROAST_LEVELS = ["Light", "Medium", "Dark"] as const
const METHODS = [
  "V60",
  "AeroPress",
  "Espresso",
  "French Press",
  "Kalita Wave",
] as const
const GRINDERS = ["Comandante", "Mahlkönig", "Fellow Ode", "1Zpresso"] as const

const FLAVOR_NOTES = [
  "Almond, Raisins, Strawberries",
  "Blackcurrant, Grapefruit, Brown Sugar",
  "Jasmine, Bergamot, Honey",
  "Dark Chocolate, Hazelnut, Caramel",
  "Peach, Black Tea, Lime",
  "Blueberry, Cocoa Nibs, Vanilla",
] as const

const NOTES = [
  "Sweetness carries all the way through the cup; would keep this recipe.",
  "A touch under-extracted — going one step finer next time.",
  "Bright and juicy, acidity a little sharp at first sip but settles as it cools.",
  "Heavy body, muted florals. Maybe lower the temperature a degree.",
  "Best cup from this bag so far. Bloom of 45s made a clear difference.",
  null,
] as const

function pick<T>(pool: readonly T[]): T {
  return pool[Math.floor(Math.random() * pool.length)]
}

function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function chance(probability: number) {
  return Math.random() < probability
}

// Random timestamp within the past year, so ordering and page boundaries
// are meaningful.
function pastDate(daysBack = 365) {
  return new Date(Date.now() - Math.random() * daysBack * 24 * 60 * 60 * 1000)
}

// First day of the current UTC month — the granularity of the AI caps.
function currentPeriod() {
  return `${new Date().toISOString().slice(0, 7)}-01`
}

// Sign the peer up through Better Auth rather than writing user/account rows
// by hand: password hashing and the username backfill hook come for free. The
// verification email it triggers is a no-op locally (lib/email.ts logs when
// RESEND_API_KEY is unset, and only warns when Resend rejects the address).
async function ensureUser(peer: (typeof PEERS)[number]) {
  const existing = await db.query.user.findFirst({
    where: eq(user.email, peer.email),
  })
  if (existing) return existing

  await auth.api.signUpEmail({
    body: { ...peer, password: PEER_PASSWORD },
  })
  const created = await db.query.user.findFirst({
    where: eq(user.email, peer.email),
  })
  if (!created) throw new Error(`Failed to create ${peer.email}`)
  console.log(`Created ${peer.email} (password: ${PEER_PASSWORD})`)
  return created
}

function makeBeans(userId: string, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const [roastery, roasteryCountry] = pick(ROASTERIES)
    const detailed = chance(0.5)
    return {
      userId,
      name: `${pick(BEAN_NAMES)} #${i + 1}`,
      roastery,
      roasteryCountry,
      originCountry: pick(ORIGINS),
      process: pick(PROCESSES),
      roastLevel: pick(ROAST_LEVELS),
      flavorNotes: pick(FLAVOR_NOTES),
      cuppingScore: randInt(82, 92) + 0.5 * randInt(0, 1),
      ...(detailed ? pick(BEAN_DETAILS) : {}),
      roastDate: detailed ? pastDate(90).toISOString().slice(0, 10) : null,
      price: detailed ? `£${randInt(8, 22)}.50 / 250 g` : null,
      weightG: detailed ? pick([200, 225, 250, 340]) : null,
      productUrl: detailed ? "https://example.coffee/collections/beans" : null,
      createdAt: pastDate(),
    }
  })
}

function makeBrews(userId: string, beanIds: string[], count: number) {
  return Array.from({ length: count }, () => {
    const method = pick(METHODS)
    const espresso = method === "Espresso"
    const coffeeG = espresso ? randInt(16, 20) : randInt(12, 22)
    const brewWeightG = espresso ? coffeeG * 2 : null
    // A quarter of the log is unscored. null on a taste axis means "I didn't
    // note it" — the brew page renders those as — rather than a 0, and the
    // Brew Master gate skips them. Nothing here used to reach either path.
    const scored = chance(0.75)
    // TDS is measured, not guessed, so most entries lack it even when scored.
    const tds = espresso && chance(0.4) ? randInt(850, 1150) / 100 : null
    return {
      userId,
      beanId: pick(beanIds),
      method,
      grinder: pick(GRINDERS),
      grindSetting: espresso
        ? (randInt(4, 20) / 10).toFixed(1)
        : `${randInt(18, 30)} clicks`,
      coffeeG,
      waterG: espresso ? null : coffeeG * randInt(14, 17),
      temperatureC: randInt(88, 96),
      timeSeconds: espresso ? randInt(22, 34) : randInt(100, 240),
      brewWeightG,
      tds,
      extractionYield:
        tds && brewWeightG
          ? Number(((tds * brewWeightG) / coffeeG).toFixed(1))
          : null,
      rating: scored ? randInt(4, 10) : null,
      tasteAroma: scored ? randInt(3, 10) : null,
      tasteSweetness: scored ? randInt(3, 10) : null,
      tasteAcidity: scored ? randInt(0, 9) : null,
      tasteBitterness: scored ? randInt(0, 8) : null,
      tasteBody: scored ? randInt(3, 10) : null,
      notes: pick(NOTES),
      isPublic: chance(0.5),
      brewedAt: pastDate(),
    }
  })
}

async function seedBulk() {
  const testUser = await db.query.user.findFirst({
    where: eq(user.email, "test@example.com"),
  })
  if (!testUser) {
    console.log("No test@example.com user found — sign up first, then re-run.")
    return
  }

  const peers = []
  for (const peer of PEERS) peers.push(await ensureUser(peer))
  const everyone = [testUser, ...peers]
  const userIds = everyone.map((u) => u.id)

  // The AI features are gated on a verified email, so unverified seed accounts
  // can't reach the scan or Brew Master flows at all.
  await db
    .update(user)
    .set({ emailVerified: true })
    .where(inArray(user.id, userIds))

  await db.delete(beans).where(inArray(beans.userId, userIds))
  await db.delete(beanScanUsage).where(inArray(beanScanUsage.userId, userIds))
  await db
    .delete(brewAdviceUsage)
    .where(inArray(brewAdviceUsage.userId, userIds))

  const insertedBrews = []
  for (const owner of everyone) {
    const isTestUser = owner.id === testUser.id
    const beanRows = makeBeans(owner.id, isTestUser ? BEAN_COUNT : PEER_BEANS)
    const insertedBeans = await db
      .insert(beans)
      .values(beanRows)
      .returning({ id: beans.id })
    const brewRows = makeBrews(
      owner.id,
      insertedBeans.map((b) => b.id),
      isTestUser ? BREW_COUNT : PEER_BREWS,
    )
    insertedBrews.push(
      ...(await db.insert(brews).values(brewRows).returning({
        id: brews.id,
        userId: brews.userId,
        isPublic: brews.isPublic,
        rating: brews.rating,
      })),
    )
  }

  // Community ratings: everyone rates a slice of everyone else's public brews.
  // Some public brews stay unrated on purpose — Explore renders the ★ column
  // only once something on the page has votes.
  const publicBrews = insertedBrews.filter((brew) => brew.isPublic)
  const ratingRows = everyone.flatMap((rater) =>
    publicBrews
      .filter((brew) => brew.userId !== rater.id && chance(0.55))
      .map((brew) => ({
        userId: rater.id,
        brewId: brew.id,
        value: randInt(2, 5),
      })),
  )
  if (ratingRows.length) await db.insert(brewRatings).values(ratingRows)

  // One brew starts with cached advice, so the Brew Master panel is viewable
  // (and its cache-invalidation-on-edit behaviour testable) without spending a
  // model call — the only way to see it when BULK_QUOTA has filled the cap.
  const advised = insertedBrews.find(
    (brew) => brew.userId === testUser.id && brew.rating != null,
  )
  if (advised) {
    await db.insert(brewAdvice).values({
      brewId: advised.id,
      advice: `Your acidity is running ahead of the sweetness on this bean. Try grinding two clicks finer and holding the water at 92 °C — that usually pulls the sugars forward without turning the finish dry. Keep the bloom at 45 s; it is doing its job.`,
      model: "seed",
    })
  }

  if (process.env.BULK_QUOTA === "1") {
    const period = currentPeriod()
    await db
      .insert(beanScanUsage)
      .values({ userId: testUser.id, period, count: AI_MONTHLY_LIMIT })
    await db
      .insert(brewAdviceUsage)
      .values({ userId: testUser.id, period, count: AI_MONTHLY_LIMIT })
  }

  const quotaNote = process.env.BULK_QUOTA === "1" ? " AI quotas filled." : ""
  console.log(
    `Bulk-seeded ${BEAN_COUNT} beans / ${BREW_COUNT} brews for test@example.com, ${PEER_BEANS} / ${PEER_BREWS} for each of ${PEERS.length} peers, and ${ratingRows.length} community ratings across ${publicBrews.length} public brews.${quotaNote}`,
  )
}

seedBulk().then(() => process.exit(0))
