import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

type WorkoutLog = {
  volume: {
    value: number;
    unit: "kg" | "ibs" | "km";
  };
  note?: string;
  sets: number;
  weight: number;
  reps: number;
  duration: number;
  exercises: string[];
};

export const workoutLogs = pgTable("workout-logs", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  user: uuid()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  metadata: jsonb().$type<WorkoutLog>().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
