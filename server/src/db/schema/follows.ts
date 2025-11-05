import {
  boolean,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const follows = pgTable(
  "follows",
  {
    following: uuid()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    follower: uuid()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    isFollowing: boolean().default(true).notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (column) => [
    primaryKey({ columns: [column.follower, column.following], name: "pk" }),
  ],
);
