import { eq } from "drizzle-orm"

import { db } from "./index"
import { beans, brews, user } from "./schema"

// Seeds demo data for the test account. Idempotent: clears the test
// user's beans/brews first, then re-inserts.
async function seed() {
  const testUser = await db.query.user.findFirst({
    where: eq(user.email, "test@example.com"),
  })
  if (!testUser) {
    console.log("No test@example.com user found — sign up first, then re-run.")
    return
  }

  await db.delete(beans).where(eq(beans.userId, testUser.id))

  const [ibis] = await db
    .insert(beans)
    .values({
      userId: testUser.id,
      name: "Ibis",
      roastery: "Scarlett Coffee Roastery",
      roasteryCountry: "United Kingdom",
      originCountry: "Brazil",
      region: "Sul de Minas",
      altitude: "1,150–1,250 m",
      varietals: "Red Catuaí, Yellow Catuaí",
      process: "Natural",
      roastLevel: "Light",
      roastDate: "2026-06-12",
      flavorNotes: "Almond, Raisins, Strawberries",
      cuppingScore: 85.5,
      price: "£8.50 / 225 g",
      weightG: 225,
      productUrl: "https://scarlett.coffee/collections/beans/ibis",
    })
    .returning({ id: beans.id })

  const [kiambu] = await db
    .insert(beans)
    .values({
      userId: testUser.id,
      name: "Kiambu",
      roastery: "Rocket Bean Roastery",
      roasteryCountry: "Latvia",
      originCountry: "Kenya",
      region: "Kiambu",
      varietals: "SL-28",
      process: "Washed",
      roastLevel: "Light",
      flavorNotes: "Blackcurrant, Grapefruit, Brown Sugar",
      cuppingScore: 87,
    })
    .returning({ id: beans.id })

  await db.insert(brews).values([
    {
      userId: testUser.id,
      beanId: ibis.id,
      method: "V60",
      grinder: "Comandante",
      grindSetting: "26 clicks",
      coffeeG: 18,
      waterG: 300,
      temperatureC: 94,
      timeSeconds: 145,
      rating: 8,
      tasteAroma: 8,
      tasteSweetness: 8,
      tasteAcidity: 2,
      tasteBitterness: 2,
      tasteBody: 6,
      notes:
        "Pleasant sweetness with this Comandante setting. 94 °C keeps the acidity soft while the tropical notes stay clear.",
      isPublic: true,
      brewedAt: new Date("2026-07-02T08:30:00Z"),
    },
    {
      userId: testUser.id,
      beanId: ibis.id,
      method: "Espresso",
      grinder: "Mahlkönig",
      grindSetting: "0.5",
      coffeeG: 20,
      temperatureC: 94,
      timeSeconds: 24,
      brewWeightG: 40,
      tds: 10.25,
      extractionYield: 20.5,
      rating: 9,
      tasteAroma: 8,
      tasteSweetness: 7,
      tasteAcidity: 5,
      tasteBitterness: 4,
      tasteBody: 9,
      notes: "Perfectly balanced espresso.",
      isPublic: true,
      brewedAt: new Date("2026-06-28T07:10:00Z"),
    },
    {
      userId: testUser.id,
      beanId: kiambu.id,
      method: "AeroPress",
      grinder: "Comandante",
      grindSetting: "22 clicks",
      coffeeG: 15,
      waterG: 220,
      temperatureC: 92,
      timeSeconds: 120,
      rating: 7,
      tasteAroma: 7,
      tasteSweetness: 6,
      tasteAcidity: 8,
      tasteBitterness: 2,
      tasteBody: 5,
      notes: "Bright and juicy, could go a touch finer.",
      isPublic: false,
      brewedAt: new Date("2026-06-26T09:00:00Z"),
    },
  ])

  console.log("Seeded 2 beans and 3 brews for test@example.com.")
}

seed().then(() => process.exit(0))
