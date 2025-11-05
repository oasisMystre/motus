import { jsonb, pgTable, text, unique, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";
import { muscles } from "./muscles";
import { equipments } from "./equipments";

type Metadata = {};

export const exercises = pgTable(
  "exercises",
  {
    id: uuid().defaultRandom().primaryKey(),
    image: text(),
    name: text().notNull(),
    note: text(),
    equipment: uuid()
      .references(() => equipments.id, { onDelete: "cascade" })
      .notNull(),
    primary_muscle_group: uuid()
      .references(() => muscles.id, { onDelete: "cascade" })
      .notNull(),
    other_muscles: uuid().array().notNull(),
    exercise_types: text({
      enum: ["time", "reps", "weight", "distance", "speed"],
    })
      .array()
      .notNull(),
    metadata: jsonb().$type<Metadata>().notNull(),
    user: uuid().references(() => users.id, { onDelete: "set null" }),
  },
  (column) => [unique().on(column.user, column.name).nullsNotDistinct()],
);
