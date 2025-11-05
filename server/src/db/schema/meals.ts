import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

type Metadata = {
  portionSize: {
    value: number;
    unit: "kg" | "g" | "cup" | "litre" | "bag" | "sachet";
  };
  nutriments: Record<
    string,
    { value: number; unit: "g" | "mg" | "%" | "cal" | "kcal" }
  >;
};

export const meals = pgTable("meals", {
  id: text()
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  brandName: text(),
  name: text().notNull(),
  user: uuid().references(() => users.id, { onDelete: "cascade" }),
  metadata: jsonb().$type<Metadata>().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
