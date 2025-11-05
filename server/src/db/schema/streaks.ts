import {
  boolean,
  date,
  integer,
  pgTable,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const streaks = pgTable(
  "streaks",
  {
    id: uuid().defaultRandom().notNull(),
    steps: integer().notNull(),
    user: uuid()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    completed: boolean().default(false).notNull(),
    createdAt: date().defaultNow().notNull(),
  },
  (column) => [unique().on(column.user, column.createdAt).nullsNotDistinct()],
);
