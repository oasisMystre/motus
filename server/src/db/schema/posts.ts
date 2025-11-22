import {
  boolean,
  foreignKey,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { mealLogs } from "./meal-logs";
import { routineLogs } from "./routine-logs";

type Metadata = {};

export const posts = pgTable("posts", {
  id: uuid().defaultRandom().primaryKey(),
  user: uuid()
    .references(() => users.id)
    .notNull(),
  mealLog: uuid().references(() => mealLogs.id, { onDelete: "cascade" }),
  routineLog: uuid().references(() => routineLogs.id, { onDelete: "cascade" }),
  images: text().array(),
  visibility: text({ enum: ["everyone", "private", "sensitive"] })
    .default("everyone")
    .notNull(),
  title: text().notNull(),
  description: text(),
  metadata: jsonb().$type<Metadata>(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const postLikes = pgTable(
  "postLikes",
  {
    id: uuid().defaultRandom().primaryKey(),
    post: uuid()
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    user: uuid()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    liked: boolean().default(false).notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (column) => [unique().on(column.post, column.user).nullsNotDistinct()],
);

export const comments = pgTable(
  "comments",
  {
    id: uuid().defaultRandom().primaryKey(),
    parent: uuid(),
    text: text().notNull(),
    user: uuid()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    post: uuid()
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    tags: uuid().array(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (column) => [
    foreignKey({
      columns: [column.parent],
      foreignColumns: [column.id],
      name: "comment_parent_fk",
    }).onDelete("cascade"),
  ],
);

export const commentLikes = pgTable(
  "commentLikes",
  {
    id: uuid().defaultRandom().primaryKey(),
    comment: uuid()
      .references(() => comments.id, { onDelete: "cascade" })
      .notNull(),
    user: uuid()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    liked: boolean().default(false).notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (column) => [unique().on(column.comment, column.user).nullsNotDistinct()],
);
