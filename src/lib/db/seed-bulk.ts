import { eq } from "drizzle-orm"

import { db } from "./index"
import { beans, brews, user } from "./schema"

// Bulk seed for testing pagination and data caps. Generates BULK_BEANS beans
// and BULK_BREWS brews (defaults 25 / 120) for the test account — deliberately
// above the per-user caps, since it inserts directly and bypasses the server
// actions that enforce them. Idempotent: clears the test user's beans/brews
// first (brews go with the bean FK cascade), then re-inserts.
const BEAN_COUNT = Number(process.env.BULK_BEANS) || 25
const BREW_COUNT = Number(process.env.BULK_BREWS) || 120

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

// Random timestamp within the past year, so ordering and page boundaries
// are meaningful.
function pastDate(daysBack = 365) {
  return new Date(Date.now() - Math.random() * daysBack * 24 * 60 * 60 * 1000)
}

async function seedBulk() {
  const testUser = await db.query.user.findFirst({
    where: eq(user.email, "test@example.com"),
  })
  if (!testUser) {
    console.log("No test@example.com user found — sign up first, then re-run.")
    return
  }

  await db.delete(beans).where(eq(beans.userId, testUser.id))

  const beanRows = Array.from({ length: BEAN_COUNT }, (_, i) => {
    const [roastery, roasteryCountry] = pick(ROASTERIES)
    return {
      userId: testUser.id,
      name: `${pick(BEAN_NAMES)} #${i + 1}`,
      roastery,
      roasteryCountry,
      originCountry: pick(ORIGINS),
      process: pick(PROCESSES),
      roastLevel: pick(ROAST_LEVELS),
      flavorNotes: pick(FLAVOR_NOTES),
      cuppingScore: randInt(82, 92) + 0.5 * randInt(0, 1),
      createdAt: pastDate(),
    }
  })
  const insertedBeans = await db
    .insert(beans)
    .values(beanRows)
    .returning({ id: beans.id })

  const brewRows = Array.from({ length: BREW_COUNT }, () => {
    const method = pick(METHODS)
    const espresso = method === "Espresso"
    const coffeeG = espresso ? randInt(16, 20) : randInt(12, 22)
    return {
      userId: testUser.id,
      beanId: pick(insertedBeans).id,
      method,
      grinder: pick(GRINDERS),
      grindSetting: espresso
        ? (randInt(4, 20) / 10).toFixed(1)
        : `${randInt(18, 30)} clicks`,
      coffeeG,
      waterG: espresso ? null : coffeeG * randInt(14, 17),
      temperatureC: randInt(88, 96),
      timeSeconds: espresso ? randInt(22, 34) : randInt(100, 240),
      brewWeightG: espresso ? coffeeG * 2 : null,
      rating: randInt(4, 10),
      tasteAroma: randInt(3, 10),
      tasteSweetness: randInt(3, 10),
      tasteAcidity: randInt(1, 9),
      tasteBitterness: randInt(1, 8),
      tasteBody: randInt(3, 10),
      notes: pick(NOTES),
      isPublic: Math.random() < 0.5,
      brewedAt: pastDate(),
    }
  })
  await db.insert(brews).values(brewRows)

  console.log(
    `Bulk-seeded ${BEAN_COUNT} beans and ${BREW_COUNT} brews for test@example.com.`,
  )
}

seedBulk().then(() => process.exit(0))
