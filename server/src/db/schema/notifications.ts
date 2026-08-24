import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

type Intl = {
  text: string;
  external: boolean;
  extra?: Record<string, unknown>;
};

type Action = {
  link?: string;
  type?: string;
  extra?: Record<string, unknown>;
};

export const notifications = pgTable("notifications", {
  id: uuid().defaultRandom().primaryKey(),
  title: jsonb().$type<Intl>(),
  subtitle: text().$type<Intl>(),
  icon: text(),
  action: jsonb().$type<Action>(),
  user: uuid()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
