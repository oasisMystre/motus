import z from "zod";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { follows } from "../../db/schema";
import { publicProcedure, router } from "../../trpc";
import { createNotification } from "../notifications/notification.controller";
import {
  followInsertSchema,
  followSelectSchema,
  paginationSchema,
} from "../../external";

export const followRouter = router({
  create: publicProcedure
    .input(followInsertSchema.omit({ follower: true }))
    .mutation(async ({ ctx, input }) => {
      const [createdFollow] = await ctx.drizzle
        .insert(follows)
        .values({ ...input, follower: ctx.user.id })
        .onConflictDoUpdate({
          set: { isFollowing: input.isFollowing },
          target: [follows.following, follows.follower],
        })
        .returning();

      if (createdFollow) {
        if (input.isFollowing)
          await createNotification(ctx.drizzle, {
            user: createdFollow.following,
            title: {
              text: "notifications.new_follower",
              external: true,
              extra: {
                username: ctx.user.username,
              },
            },
            action: {
              type: "new_follower",
              extra: {
                user: ctx.user.id,
              },
            },
            icon: ctx.user.profile.avatar,
          });

        if (createdFollow) return createdFollow;
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "follow not created",
      });
    }),
  list: publicProcedure
    .input(paginationSchema)
    .output(z.array(followSelectSchema.omit({ following: true })))
    .query(async ({ ctx, input }) => {
      return ctx.drizzle.query.follows.findMany({
        ...input,
        with: {
          follower: true,
        },
        where: and(
          eq(follows.following, ctx.user.id),
          eq(follows.isFollowing, true),
        ),
      });
    }),
});
