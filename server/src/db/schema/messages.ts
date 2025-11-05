import {
  foreignKey,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";

type Content =
  | {
      type: "text" | "image";

      data: string;
    }
  | {
      type:
        | "add-routine"
        | "add-meal"
        | "log-meal"
        | "log-routine"
        | "log-workout";
      summary?: string;
      data:
        | { id: string; name: string }
        | { id: string; name: string; brandName?: string };
    };

export const messages = pgTable(
  "messages",
  {
    id: uuid().defaultRandom().primaryKey(),
    role: text({ enum: ["user", "system", "assistant"] }).notNull(),
    content: jsonb().$type<Content>().notNull(),
    reply: uuid(),
    user: uuid()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (column) => [
    foreignKey({
      columns: [column.reply],
      foreignColumns: [column.id],
      name: "message_reply_fk",
    }),
  ],
);
