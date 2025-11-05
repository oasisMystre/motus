import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";
import { routines } from "./routines";

export const workouts = pgTable("workouts", {
  id: uuid().defaultRandom().primaryKey(),
  user: uuid()
    .references(() => users.id)
    .notNull(),
  routine: uuid()
    .references(() => routines.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
