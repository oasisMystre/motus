import z from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { RewardType } from "../types";
import {
  commentLikes,
  comments,
  equipments,
  exercises,
  follows,
  goals,
  mealLogs,
  meals,
  messages,
  muscles,
  notifications,
  postLikes,
  posts,
  rewards,
  rewardTypes,
  routineLogs,
  routines,
  streaks,
  users,
  workoutLogs,
  workouts,
} from "./schema";

export const goalSchema = z.object({
  weeklyGoal: z.object({
    value: z.number(),
    unit: z.enum(["kg", "ibs"]),
  }),
  goalWeight: z.object({
    value: z.number(),
    unit: z.enum(["kg", "ibs"]),
  }),
  currentWeight: z.object({
    value: z.number(),
    unit: z.enum(["kg", "ibs"]),
  }),
  startingWeight: z.object({
    value: z.number(),
    date: z.number(),
    unit: z.enum(["kg", "ibs"]),
  }),
  activityLevel: z.enum([
    "not-very-active",
    "lightly-active",
    "active",
    "very-active",
  ]),
});

export const profileSchema = z.object({
  avatar: z.url().optional(),
  gender: z.enum(["male", "female", "others"]).optional(),
  height: z
    .object({ unit: z.enum(["cm", "in"]), value: z.number() })
    .optional(),
  weight: z
    .object({ unit: z.enum(["kg", "ibs"]), value: z.number() })
    .optional(),
  age: z.number().optional(),
  location: z.number().optional(),
  steps: z.coerce.number(),
  goals: goalSchema.optional(),
});

export const userInsertSchema = createInsertSchema(users, {
  profile: profileSchema,
});
export const userSelectSchema = createSelectSchema(users, {
  profile: profileSchema,
});
export const userExtendSelectSchema = userSelectSchema.extend({
  workoutsCount: z.number(),
  routinesCount: z.number(),
  mealsCount: z.number(),
  followingCount: z.number(),
  followersCount: z.number(),
});

export const followInsertSchema = createInsertSchema(follows);
export const followSelectSchema = createSelectSchema(follows, {
  follower: userSelectSchema,
  following: userSelectSchema,
});

export const mealInsertSchema = createInsertSchema(meals);
export const mealSelectSchema = createSelectSchema(meals);

const routineLogMetadataSchema = z.object({
  sets: z.coerce.number().gt(0, { error: "sets required" }),
  duration: z.coerce.number().gt(0, { error: "duration required" }),
  volume: z.object({ value: z.number(), unit: z.enum(["kg", "km", "ibs"]) }),
});

export const routineLogInsertSchema = createInsertSchema(routineLogs, {
  metadata: routineLogMetadataSchema,
});
export const routineLogSelectSchema = createSelectSchema(routineLogs, {
  metadata: routineLogMetadataSchema,
});

const workoutMetadataSchema = routineLogMetadataSchema.extend({
  reps: z.coerce.number().gt(0, { error: "reps required" }),
  weight: z.coerce
    .number({ error: "Invalid weight" })
    .gt(0, { error: "weight required" }),
  note: z.string().optional(),
});

export const workoutLogInsertSchema = createInsertSchema(workoutLogs, {
  metadata: workoutMetadataSchema,
  name: z.string().trim().min(1, { error: "Routine name required" }),
});
export const workoutLogSelectSchema = createSelectSchema(workoutLogs, {
  metadata: workoutMetadataSchema,
  name: z.string().trim().min(1, { error: "Workout name required" }),
});

const mealLogMetadataSchema = z.object({
  energy: z.object({
    value: z.number(),
    unit: z.literal("kcal"),
  }),
  fats: z.object({
    value: z.number(),
    unit: z.literal("g"),
  }),
  proteins: z.object({
    value: z.number(),
    unit: z.literal("g"),
  }),
  carbohydrates: z.object({
    value: z.number(),
    unit: z.literal("g"),
  }),
});

export const mealLogInsertSchema = createInsertSchema(mealLogs, {
  image: z.url().optional(),
  metadata: mealLogMetadataSchema,
  meals: z.string().array().min(1),
  name: z.string().trim().min(1, { error: "Meal Name Required" }),
});
export const mealLogSelectSchema = createSelectSchema(mealLogs, {
  meals: z.array(mealSelectSchema),
  metadata: mealLogMetadataSchema,
});

export const goalInsertSchema = createInsertSchema(goals);
export const goalSelectSchema = createSelectSchema(goals);

export const muscleSelectSchema = createSelectSchema(muscles);
export const equipmentSelectSchema = createSelectSchema(equipments);

export const exerciseInsertSchema = createInsertSchema(exercises);
export const exerciseSelectSchema = createSelectSchema(exercises, {
  equipment: equipmentSelectSchema,
  other_muscles: z.array(muscleSelectSchema),
  primary_muscle_group: muscleSelectSchema,
});

export const routineInsertSchema = createInsertSchema(routines, {
  name: z.string().trim().min(1),
  metadata: z.object({
    exercises: z.array(
      z.object({
        id: z.uuid(),
        sets: z.array(z.any()),
        note: z.string().nullish(),
        restTimer: z.number().nullish(),
      }),
    ),
  }),
});
const $routineSelectSchema = createSelectSchema(routines, {
  metadata: z.object({
    exercises: z.array(
      z
        .object({
          sets: z.array(z.any()),
          note: z.string().nullish(),
          restTimer: z.number().nullish(),
        })
        .and(exerciseSelectSchema),
    ),
  }),
});
export const routineSelectSchema = $routineSelectSchema.extend({
  previous: createSelectSchema(routines).omit({ previous: true }).nullish(),
});

export const workoutInsertSchema = createInsertSchema(workouts);
export const workoutSelectSchema = createSelectSchema(workouts);

export const rewardTypeSelectSchema = createSelectSchema(rewardTypes);

export const rewardSelectSchema = createSelectSchema(rewards, {
  type: rewardTypeSelectSchema,
});
export const rewardInsertSchema = createInsertSchema(rewards, {
  type: z.enum(RewardType),
});

export const streakSelectSchema = createSelectSchema(streaks);
export const streakInsertSchema = createInsertSchema(streaks);

const minimalUserSchema = userSelectSchema
  .pick({ name: true, id: true, username: true })
  .extend({ profile: profileSchema.pick({ avatar: true }) });

export const postMetadataSchema = z.object({});
export const postInsertSchema = createInsertSchema(posts, {
  title: z.string().trim().min(1),
  metadata: postMetadataSchema.nullish(),
});
export const postSelectSchema = createSelectSchema(posts, {
  metadata: postMetadataSchema.nullish(),
  log: routineLogSelectSchema.optional(),
  user: minimalUserSchema,
});

export const postLikeSelectSchema = createSelectSchema(postLikes, {
  user: minimalUserSchema,
});
export const postLikeInsertSchema = createInsertSchema(postLikes);

export const commentSelectSchema = createSelectSchema(comments, {
  user: minimalUserSchema,
});
export const commentInsertSchema = createInsertSchema(comments);
export const commentLikeInsertSchema = createInsertSchema(commentLikes);

export const postExtendedSelectSchema = postSelectSchema.extend({
  liked: z.boolean(),
  likeCount: z.number(),
  commentCount: z.number(),
  peekLikes: z.array(postLikeSelectSchema),
  peekComments: z.array(commentSelectSchema),
});

export const paginationSchema = z.object({
  offset: z.number().optional(),
  limit: z.number().optional(),
});

export const messageContentSchema = z.union([
  z.object({
    type: z.enum(["text", "image"]),
    data: z.string(),
  }),
  z.object({
    type: z.enum([
      "add-routine",
      "add-meal",
      "log-meal",
      "log-routine",
      "log-workout",
    ]),
    summary: z.string().optional(),
    data: z.object({ id: z.string().uuid(), name: z.string() }).or(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        brandName: z.string().optional(),
      }),
    ),
  }),
]);

export const messageInsertSchema = createInsertSchema(messages, {
  content: z.string(),
});
export const messageSelectSchema = createSelectSchema(messages, {
  content: messageContentSchema,
});

const intlSchema = z.object({
  text: z.string(),
  external: z.boolean(),
  extra: z.record(z.string(), z.unknown()).optional(),
});

export const notificationInsertSchema = createInsertSchema(notifications, {
  title: intlSchema.nullable().optional(),
  subtitle: intlSchema.nullable().optional(),
});
export const notificationSelectSchema = createSelectSchema(notifications, {
  title: intlSchema.nullable().optional(),
  subtitle: intlSchema.nullable().optional(),
});
