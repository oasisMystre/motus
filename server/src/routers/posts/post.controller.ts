import type z from "zod";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  not,
  type SQL,
} from "drizzle-orm";

import type { Database } from "../../db";
import { coalesce } from "../../db/custom-value";
import { postExtendedSelectSchema, type userSelectSchema } from "../../db/zod";
import { expandRoutines } from "../routines/routine.controller";
import {
  comments,
  routineLogs,
  postLikes,
  posts,
  users,
  follows,
  routines,
  mealLogs,
  meals,
  exercises,
} from "../../db/schema";

export const getPostsWhere = async <T extends SQL<unknown> | undefined>(
  db: Database,
  where: T | undefined,
  likeWhere: T | undefined,
  options: {
    limit?: number;
    offset?: number;
    owner: z.infer<typeof userSelectSchema>["id"];
  },
) => {
  const likeCount = db
    .select({ post: postLikes.post, count: count().as("likeCount") })
    .from(postLikes)
    .where(eq(postLikes.liked, true))
    .groupBy(postLikes.post)
    .as("likeCount");

  const commentCount = db
    .select({ post: comments.post, count: count().as("commentCount") })
    .from(comments)
    .groupBy(comments.post)
    .as("commentCount");

  const liked = db.select().from(postLikes).where(likeWhere).as("liked");

  const query = db
    .select({
      ...getTableColumns(posts),
      user: getTableColumns(users),
      routine: getTableColumns(routines),
      mealLog: getTableColumns(mealLogs),
      routineLog: getTableColumns(routineLogs),
      liked: coalesce(liked.liked, false).mapWith(Boolean),
      likeCount: coalesce(likeCount.count, 0).mapWith(parseFloat),
      commentCount: coalesce(commentCount.count, 0).mapWith(parseFloat),
      isFollowing: coalesce(follows.isFollowing, false).mapWith(Boolean),
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.user))
    .leftJoin(liked, eq(liked.post, posts.id))
    .leftJoin(likeCount, eq(likeCount.post, posts.id))
    .leftJoin(mealLogs, eq(mealLogs.id, posts.mealLog))
    .leftJoin(commentCount, eq(commentCount.post, posts.id))
    .leftJoin(routineLogs, eq(routineLogs.id, posts.routineLog))
    .leftJoin(routines, eq(routines.id, routineLogs.routine))
    .leftJoin(
      follows,
      and(
        eq(follows.following, posts.user),
        eq(follows.follower, options.owner),
      ),
    )
    .orderBy(desc(posts.createdAt))
    .where(where);

  if (options) {
    if (options.limit) query.limit(options.limit);
    if (options.offset) query.offset(options.offset);
  }

  const postList = await query.execute();

  return db.transaction((db) =>
    Promise.all(
      postList.map(async (post) => {
        const [peekLikes, peekComments, postRoutines, mealLogMeals] =
          await Promise.all([
            db
              .select({
                ...getTableColumns(postLikes),
                user: getTableColumns(users),
              })
              .from(postLikes)
              .limit(2)
              .innerJoin(users, eq(users.id, postLikes.user))
              .where(
                and(
                  eq(postLikes.post, post.id),
                  eq(postLikes.liked, true),
                  options && options.owner
                    ? not(eq(postLikes.user, options.owner))
                    : undefined,
                ),
              )
              .orderBy(desc(postLikes.createdAt))
              .execute(),
            db
              .select({
                ...getTableColumns(comments),
                user: getTableColumns(users),
              })
              .from(comments)
              .limit(2)
              .innerJoin(users, eq(users.id, comments.user))
              .where(eq(comments.post, post.id))
              .orderBy(desc(comments.createdAt))
              .execute(),
            post.routine ? expandRoutines(db, [post.routine]) : undefined,
            post.mealLog?.meals
              ? db
                  .select()
                  .from(meals)
                  .where(inArray(meals.id, meals))
                  .execute()
              : undefined,
          ]);

        return {
          ...post,
          peekLikes,
          peekComments,
          routine: postRoutines?.at(0),
          mealLog: post.mealLog
            ? {
                ...post.mealLog,
                meals: mealLogMeals!,
              }
            : undefined,
        };
      }),
    ),
  );
};
