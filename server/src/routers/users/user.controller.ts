import type z from "zod";
import { count, eq, getTableColumns } from "drizzle-orm";

import type { Database } from "../../db";
import { coalesce } from "../../db/custom-value";
import type { userSelectSchema } from "../../db/zod";
import {
  follows,
  users,
  mealLogs,
  routineLogs,
  workoutLogs,
} from "../../db/schema";

export const getUserById = async (
  db: Database,
  id: z.infer<typeof userSelectSchema>["id"],
) => {
  const mealsCount = db
    .select({ user: mealLogs.user, count: count().as("mealsCount") })
    .from(mealLogs)
    .where(eq(mealLogs.user, id))
    .groupBy(mealLogs.user)
    .as("mealsCount");
  const workoutsCount = db
    .select({ user: workoutLogs.user, count: count().as("workoutsCount") })
    .from(workoutLogs)
    .where(eq(workoutLogs.user, id))
    .groupBy(workoutLogs.user)
    .as("workoutsCount");
  const routinesCount = db
    .select({ user: routineLogs.user, count: count().as("routinesCount") })
    .from(routineLogs)
    .where(eq(routineLogs.user, id))
    .groupBy(routineLogs.user)
    .as("routinesCount");
  const followingCount = db
    .select({
      user: follows.following,
      count: count().as("followingCount"),
    })
    .from(follows)
    .where(eq(follows.following, id))
    .groupBy(follows.following)
    .as("followingCount");
  const followersCount = db
    .select({ user: follows.follower, count: count().as("followersCount") })
    .from(follows)
    .where(eq(follows.follower, id))
    .groupBy(follows.follower)
    .as("followersCount");

  const [user] = await db
    .select({
      ...getTableColumns(users),
      mealsCount: coalesce(mealsCount.count, 0).mapWith(parseFloat),
      workoutsCount: coalesce(workoutsCount.count, 0).mapWith(parseFloat),
      routinesCount: coalesce(routinesCount.count, 0).mapWith(parseFloat),
      followingCount: coalesce(followingCount.count, 0).mapWith(parseFloat),
      followersCount: coalesce(followersCount.count, 0).mapWith(parseFloat),
    })
    .from(users)
    .where(eq(users.id, id))
    .leftJoin(mealsCount, eq(mealsCount.user, id))
    .leftJoin(workoutsCount, eq(workoutsCount.user, id))
    .leftJoin(routinesCount, eq(routinesCount.user, id))
    .leftJoin(followersCount, eq(followersCount.user, id))
    .leftJoin(followingCount, eq(followingCount.user, id))
    .execute();

  return user;
};
