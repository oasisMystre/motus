import type z from "zod";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  not,
  sql,
  type SQL,
} from "drizzle-orm";

import type { Database } from "../../db";
import { coalesce } from "../../db/custom-value";
import type { userSelectSchema } from "../../db/zod";
import {
  comments,
  routineLogs,
  postLikes,
  posts,
  users,
} from "../../db/schema";

export const getPostsWhere = async <T extends SQL<unknown> | undefined>(
  db: Database,
  where?: T,
  likeWhere?: T,
  options?: {
    limit?: number;
    offset?: number;
    owner?: z.infer<typeof userSelectSchema>["id"];
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

  const liked = db
    .select()
    .from(postLikes)
    .where(likeWhere)
    .limit(1)
    .as("liked");

  const query = db
    .select({
      ...getTableColumns(posts),
      log: getTableColumns(routineLogs),
      user: getTableColumns(users),
      liked: coalesce(liked.liked, false).mapWith(Boolean),
      likeCount: coalesce(likeCount.count, 0).mapWith(parseFloat),
      commentCount: coalesce(commentCount.count, 0).mapWith(parseFloat),
    })
    .from(posts)
    .innerJoin(routineLogs, eq(routineLogs.id, posts.log))
    .innerJoin(users, eq(users.id, posts.user))
    .leftJoin(liked, eq(liked.post, posts.id))
    .leftJoin(likeCount, eq(likeCount.post, posts.id))
    .leftJoin(commentCount, eq(commentCount.post, posts.id))
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
        const [peekLikes, peekComments] = await Promise.all([
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
        ]);

        return { ...post, peekLikes, peekComments };
      }),
    ),
  );
};
