import { relations } from "drizzle-orm"
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

import { user } from "./auth-schema"

export * from "./auth-schema"

export const beans = pgTable(
  "beans",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    roastery: text("roastery").notNull(),
    roasteryCountry: text("roastery_country"),
    originCountry: text("origin_country"),
    region: text("region"),
    altitude: text("altitude"),
    varietals: text("varietals"),
    process: text("process"),
    roastLevel: text("roast_level"),
    roastDate: date("roast_date"),
    flavorNotes: text("flavor_notes"),
    cuppingScore: real("cupping_score"),
    price: text("price"),
    weightG: integer("weight_g"),
    productUrl: text("product_url"),
    moreInfo: text("more_info"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("beans_userId_idx").on(table.userId)],
)

export const brews = pgTable(
  "brews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    beanId: text("bean_id")
      .notNull()
      .references(() => beans.id, { onDelete: "cascade" }),
    method: text("method").notNull(),
    grinder: text("grinder"),
    grindSetting: text("grind_setting"),
    coffeeG: real("coffee_g"),
    waterG: real("water_g"),
    temperatureC: real("temperature_c"),
    timeSeconds: integer("time_seconds"),
    brewWeightG: real("brew_weight_g"),
    tds: real("tds"),
    extractionYield: real("extraction_yield"),
    rating: integer("rating"), // 1–10
    tasteAroma: integer("taste_aroma"), // 0–10, same scale as rating
    tasteSweetness: integer("taste_sweetness"),
    tasteAcidity: integer("taste_acidity"),
    tasteBitterness: integer("taste_bitterness"),
    tasteBody: integer("taste_body"),
    notes: text("notes"),
    isPublic: boolean("is_public").default(false).notNull(),
    brewedAt: timestamp("brewed_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("brews_userId_idx").on(table.userId),
    index("brews_beanId_idx").on(table.beanId),
    index("brews_isPublic_idx").on(table.isPublic),
  ],
)

// Per-user, per-month counter for AI bean-scans. Caps monthly token spend
// without pulling in Redis — one row per (user, month), incremented on each
// scan. `period` is the first day of the UTC month, "YYYY-MM-01".
export const beanScanUsage = pgTable(
  "bean_scan_usage",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    period: date("period").notNull(), // first of month, "YYYY-MM-01"
    count: integer("count").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.userId, table.period] })],
)

// One row per brew — caches the AI Brew Master's advice so re-viewing a brew
// never re-bills the model. Regenerating overwrites the row.
export const brewAdvice = pgTable("brew_advice", {
  brewId: text("brew_id")
    .primaryKey()
    .references(() => brews.id, { onDelete: "cascade" }),
  advice: text("advice").notNull(),
  model: text("model"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Per-user, per-month counter for AI Brew Master generations. Same shape as
// `bean_scan_usage` — bounds monthly model spend without pulling in Redis.
export const brewAdviceUsage = pgTable(
  "brew_advice_usage",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    period: date("period").notNull(), // first of month, "YYYY-MM-01"
    count: integer("count").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.userId, table.period] })],
)

// Community ratings — one row per (user, brew). A member gives someone else's
// public brew a 1–5 star vote; re-rating upserts the same row. Distinct from
// `brews.rating` (the author's own 1–10 self-score, which AI Brew Master uses).
export const brewRatings = pgTable(
  "brew_ratings",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    brewId: text("brew_id")
      .notNull()
      .references(() => brews.id, { onDelete: "cascade" }),
    value: integer("value").notNull(), // 1–5 stars
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.brewId] }),
    index("brew_ratings_brewId_idx").on(table.brewId),
  ],
)

export const beansRelations = relations(beans, ({ one, many }) => ({
  user: one(user, { fields: [beans.userId], references: [user.id] }),
  brews: many(brews),
}))

export const brewsRelations = relations(brews, ({ one }) => ({
  user: one(user, { fields: [brews.userId], references: [user.id] }),
  bean: one(beans, { fields: [brews.beanId], references: [beans.id] }),
}))
