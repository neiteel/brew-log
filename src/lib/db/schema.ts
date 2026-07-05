import { relations } from "drizzle-orm"
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
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

export const beansRelations = relations(beans, ({ one, many }) => ({
  user: one(user, { fields: [beans.userId], references: [user.id] }),
  brews: many(brews),
}))

export const brewsRelations = relations(brews, ({ one }) => ({
  user: one(user, { fields: [brews.userId], references: [user.id] }),
  bean: one(beans, { fields: [brews.beanId], references: [beans.id] }),
}))
