import z from "zod";
import { TRPCError } from "@trpc/server";
import { and, eq, type SQL } from "drizzle-orm";

import { getPostsWhere } from "./post.controller";
import { publicProcedure, router } from "../../trpc";
import { commentLikes, comments, postLikes, posts } from "../../db/schema";
import {
  commentInsertSchema,
  commentLikeInsertSchema,
  commentSelectSchema,
  paginationSchema,
  postExtendedSelectSchema,
  postInsertSchema,
  postLikeInsertSchema,
  postSelectSchema,
  userSelectSchema,
} from "../../external";

export const postRouter = router({
  create: publicProcedure
    .input(postInsertSchema.omit({ user: true }))
    .output(postExtendedSelectSchema)
    .mutation(async ({ ctx, input }) => {
      const [createdPost] = await ctx.drizzle
        .insert(posts)
        .values({ ...input, user: ctx.user.id })
        .returning()
        .execute();

      if (createdPost) {
        const [post] = await getPostsWhere(
          ctx.drizzle,
          eq(posts.id, createdPost.id),
          eq(postLikes.user, ctx.user.id),
          { ...input, owner: ctx.user.id, limit: 1 },
        );

        if (post) return post;
      }
      throw new TRPCError({ code: "BAD_REQUEST", message: "post not created" });
    }),
  like: publicProcedure
    .input(postLikeInsertSchema.omit({ user: true }))
    .mutation(async ({ ctx, input }) => {
      const [like] = await ctx.drizzle
        .insert(postLikes)
        .values({ ...input, user: ctx.user.id })
        .returning()
        .onConflictDoUpdate({
          target: [postLikes.post, postLikes.user],
          set: input,
        })
        .execute();

      if (like) return like;

      throw new TRPCError({ code: "BAD_REQUEST", message: "post not liked" });
    }),
  list: publicProcedure
    .input(
      paginationSchema
        .extend({
          filter: z.object({
            user: postSelectSchema.shape.user.shape.id.optional(),
          }),
        })
        .optional(),
    )
    .output(z.array(postExtendedSelectSchema))
    .query(async ({ ctx, input }) => {
      let where: SQL<unknown> | undefined;
      const id =
        input && input.filter && input.filter.user
          ? input.filter.user
          : ctx.user.id;

      if (input && input.filter && input.filter.user)
        where = eq(posts.user, input.filter.user);

      return getPostsWhere(
        ctx.drizzle,
        where,
        eq(postLikes.user, ctx.user.id),
        { ...input, owner: id },
      );
    }),
  update: publicProcedure.input(z.object()).query(async () => {}),
  delete: publicProcedure
    .input(postSelectSchema.pick({ id: true }))
    .query(async () => {}),
  comment: {
    create: publicProcedure
      .input(commentInsertSchema.omit({ user: true }))
      .output(commentSelectSchema)
      .mutation(async ({ ctx, input }) => {
        const [createdComment] = await ctx.drizzle
          .insert(comments)
          .values({ ...input, user: ctx.user.id })
          .returning()
          .execute();

        if (createdComment) {
          const comment = await ctx.drizzle.query.comments.findFirst({
            with: {
              user: true,
            },
            columns: {
              user: false,
            },
            where: eq(comments.id, createdComment.id),
          });
          if (comment) return comment;
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "comment not created",
        });
      }),
    like: publicProcedure
      .input(commentLikeInsertSchema)
      .mutation(async ({ ctx, input }) => {
        const [like] = await ctx.drizzle
          .insert(commentLikes)
          .values({ ...input, user: ctx.user.id })
          .returning()
          .onConflictDoUpdate({
            target: [commentLikes.comment, commentLikes.user],
            set: { liked: commentLikes.liked },
          })
          .execute();

        if (like) return like;

        throw new TRPCError({ code: "BAD_REQUEST", message: "post not liked" });
      }),
    list: publicProcedure
      .input(
        z
          .object({
            filter: commentSelectSchema
              .pick({ parent: true, post: true })
              .partial()
              .optional(),
          })
          .and(paginationSchema.partial()),
      )
      .output(z.array(commentSelectSchema))
      .query(async ({ ctx, input: { filter, ...input } }) => {
        const where = [];

        if (filter) {
          if (filter.post) where.push(eq(comments.post, filter.post));
          if (filter.parent) where.push(eq(comments.parent, filter.parent));
        }

        const allComments = await ctx.drizzle.query.comments.findMany({
          ...input,
          with: { user: true },
          where: and(...where),
        });

        return allComments;
      }),
    delete: publicProcedure.input(z.object()).mutation(async () => {}),
  },
});
