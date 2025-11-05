import { pgTable, jsonb, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

type MealLog = {
  carbohydrates: {
    value: number;
    unit: "g";
  };
  fats: {
    value: number;
    unit: "g";
  };
  proteins: {
    value: number;
    unit: "g";
  };
  energy: {
    value: number;
    unit: "kcal";
  };
};

export const mealLogs = pgTable("meal-logs", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  image: text(),
  category: text({
    enum: ["dinner", "breakfast", "lunch", "snack"],
  }).notNull(),
  user: uuid()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  meals: text().array().notNull(),
  metadata: jsonb().$type<MealLog>().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
