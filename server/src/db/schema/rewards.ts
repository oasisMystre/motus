import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const rewardTypes = pgTable("rewardType", {
  id: serial().primaryKey(),
  title: text().unique().notNull(),
  point: integer().notNull(),
  description: text().notNull(),
});

export const rewards = pgTable(
  "rewards",
  {
    id: uuid().defaultRandom().primaryKey(),
    type: serial()
      .references(() => rewardTypes.id, { onDelete: "cascade" })
      .notNull(),
    user: uuid()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (column) => ({
    unique_rewards: unique().on(column.type, column.user, column.createdAt),
  }),
);
