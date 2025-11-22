import { relations } from "drizzle-orm";

import { users } from "./users";
import { follows } from "./follows";
import { streaks } from "./streaks";
import { muscles } from "./muscles";
import { routines } from "./routines";
import { messages } from "./messages";
import { mealLogs } from "./meal-logs";
import { exercises } from "./exercises";
import { equipments } from "./equipments";
import { routineLogs } from "./routine-logs";
import { rewards, rewardTypes } from "./rewards";
import { commentLikes, comments, postLikes, posts } from "./posts";

export const userRelations = relations(users, ({ many }) => ({
  routines: many(routines),
  exercises: many(exercises),
  streaks: many(streaks),
  rewards: many(rewards),
  followers: many(follows),
  following: many(follows),
  messages: many(messages),
}));

export const followRelations = relations(follows, ({ one }) => ({
  follower: one(users, { fields: [follows.follower], references: [users.id] }),
  following: one(users, {
    fields: [follows.following],
    references: [users.id],
  }),
}));

export const routineRelations = relations(routines, ({ one, many }) => ({
  logs: many(routineLogs),
  user: one(users, { fields: [routines.user], references: [users.id] }),
  previous: one(routines, {
    fields: [routines.previous],
    references: [routines.id],
  }),
}));
export const exerciseRelations = relations(exercises, ({ one }) => ({
  user: one(users, { fields: [exercises.user], references: [users.id] }),
  equipment: one(equipments, {
    fields: [exercises.equipment],
    references: [equipments.id],
  }),
  primary_muscle_group: one(muscles, {
    fields: [exercises.primary_muscle_group],
    references: [muscles.id],
  }),
}));

export const rewardTypeRelations = relations(rewardTypes, ({ many }) => ({}));

export const rewardRelations = relations(rewards, ({ one }) => ({
  user: one(users, { fields: [rewards.user], references: [users.id] }),
  type: one(rewardTypes, {
    fields: [rewards.type],
    references: [rewardTypes.id],
  }),
}));

export const streakRelations = relations(streaks, ({ one }) => ({
  user: one(users, { fields: [streaks.user], references: [users.id] }),
}));

export const routineLogRelations = relations(routineLogs, ({ one, many }) => ({
  posts: many(posts),
  routine: one(routines, {
    fields: [routineLogs.routine],
    references: [routines.id],
  }),
}));

export const postRelations = relations(posts, ({ one, many }) => ({
  likes: many(postLikes),
  mealLog: one(mealLogs, {
    fields: [posts.mealLog],
    references: [mealLogs.id],
  }),
  routineLog: one(routineLogs, {
    fields: [posts.routineLog],
    references: [routineLogs.id],
  }),
  user: one(users, { fields: [posts.user], references: [users.id] }),
}));
export const postLikeRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, { fields: [postLikes.post], references: [posts.id] }),
}));
export const commentRelations = relations(comments, ({ one, many }) => ({
  replies: many(comments),
  likes: many(commentLikes),
  user: one(users, { fields: [comments.user], references: [users.id] }),
  parent: one(comments, {
    fields: [comments.parent],
    references: [comments.id],
  }),
  post: one(posts, { fields: [comments.post], references: [posts.id] }),
}));
export const commentLikeRelations = relations(commentLikes, ({ one }) => ({
  parent: one(comments, {
    fields: [commentLikes.comment],
    references: [comments.id],
  }),
}));

export const messageRelations = relations(messages, ({ one }) => ({
  user: one(users, { fields: [messages.user], references: [users.id] }),
  reply: one(messages, { fields: [messages.reply], references: [messages.id] }),
}));
