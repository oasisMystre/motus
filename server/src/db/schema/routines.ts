import {
  foreignKey,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";

type Routine = {
  exercises: {
    id: string;
    note?: string | null;
    restTimer?: number | null;
    sets: Record<string, string | boolean>[];
  }[];
};

export const routines = pgTable(
  "routines",
  {
    id: uuid().defaultRandom().primaryKey(),
    user: uuid()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    name: text().notNull(),
    previous: uuid(),
    metadata: jsonb().$type<Routine>().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (column) => [
    foreignKey({
      columns: [column.previous],
      foreignColumns: [column.id],
      name: "routine_previous_fk",
    }).onDelete("cascade"),
  ],
);
