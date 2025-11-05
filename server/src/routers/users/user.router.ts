import z from "zod";
import { format } from "util";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, like, not, or, type SQL } from "drizzle-orm";

import { follows, users } from "../../db/schema";
import { getUserById } from "./user.controller";
import { coalesce } from "../../db/custom-value";
import { publicProcedure, router } from "../../trpc";
import {
  paginationSchema,
  userExtendSelectSchema,
  userInsertSchema,
  userSelectSchema,
} from "../../db/zod";

export const userRouter = router({
  retrieve: publicProcedure
    .input(userSelectSchema.pick({ id: true }).optional())
    .output(userExtendSelectSchema.extend({ token: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const id = input?.id ? input.id : ctx.user.id;
      const user = await getUserById(ctx.drizzle, id);
      if (user) return { ...user, token: ctx.user.token };

      throw new TRPCError({ code: "NOT_FOUND", message: "user not found" });
    }),
  update: publicProcedure
    .input(userInsertSchema.partial())
    .mutation(async ({ ctx, input }) => {
      const [user] = await ctx.drizzle
        .update(users)
        .set(input)
        .where(eq(users.id, ctx.user.id))
        .returning()
        .execute();

      if (user) return user;

      throw new TRPCError({ code: "NOT_FOUND", message: "user not found" });
    }),
  delete: publicProcedure.mutation(({ ctx }) => {
    return ctx.drizzle.delete(users).where(eq(users.id, ctx.user.id)).execute();
  }),
  search: publicProcedure
    .input(
      z
        .object(paginationSchema.shape)
        .extend({ search: z.string().min(1).optional() })
        .optional(),
    )
    .output(z.array(userSelectSchema.extend({ isFollowing: z.boolean() })))
    .query(async ({ ctx, input }) => {
      const where: (SQL<unknown> | undefined)[] = [];

      if (input?.search) {
        const innerWhere: SQL<unknown>[] = [];

        innerWhere.push(like(users.name, format("%%%s%%", input.search)));
        innerWhere.push(like(users.username, format("%%%s%%", input.search)));

        where.push(or(...innerWhere));
      }

      const following = ctx.drizzle.select().from(follows).as("following");

      const query = ctx.drizzle
        .select({
          ...getTableColumns(users),
          isFollowing: coalesce(following.isFollowing, false).mapWith(Boolean),
        })
        .from(users)
        .leftJoin(following, eq(following.follower, ctx.user.id))
        .where(and(...where, not(eq(users.id, ctx.user.id))));

      if (input) {
        if (input.limit) query.limit(input.limit);
        if (input.offset) query.offset(input.offset);
      }

      return query.execute();
    }),
  analytic: publicProcedure
    .input(z.object())
    .output(z.object({}))
    .query(async () => ({})),
});
