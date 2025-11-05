import { pgTable, jsonb, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";
import { routines } from "./routines";

type RoutineLog = {
  volume: {
    value: number;
    unit: "kg" | "ibs" | "km";
  };
  note?: string;
  sets: number;
  reps?: number;
  weight?: number;
  duration: number;
};

export const routineLogs = pgTable("routine-logs", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  user: uuid()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  routine: uuid()
    .references(() => routines.id, { onDelete: "cascade" })
    .notNull(),
  metadata: jsonb().$type<RoutineLog>().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
