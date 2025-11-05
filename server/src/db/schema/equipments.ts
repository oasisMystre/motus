import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const equipments = pgTable("equipments", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().unique().notNull(),
  image: text(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
