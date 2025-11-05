import z from "zod";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq } from "drizzle-orm";

import { RewardType } from "../../types";
import { date } from "../../db/custom-value";
import { rewards, streaks } from "../../db/schema";
import { publicProcedure, router } from "../../trpc";
import { streakInsertSchema, streakSelectSchema } from "../../external";

export const streakRouter = router({
  create: publicProcedure
    .input(streakInsertSchema.omit({ user: true, completed: true }))
    .output(streakSelectSchema)
    .mutation(async ({ ctx, input }) => {
      const completed = Boolean(
        input.steps && input.steps >= ctx.user.profile.steps,
      );

      const [streak] = await ctx.drizzle
        .insert(streaks)
        .values({ ...input, completed, user: ctx.user.id })
        .returning()
        .onConflictDoUpdate({
          target: [streaks.user, streaks.createdAt],
          set: { steps: streaks.steps },
        })
        .execute();

      if (streak) return streak;

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "streak not created",
      });
    }),
  aggregate: publicProcedure
    .output(z.number().optional())
    .query(async ({ ctx }) => {
      const [streak] = await ctx.drizzle
        .select({ streak: count(streaks.id).as("streak") })
        .from(streaks)
        .groupBy(date(streaks.createdAt))
        .orderBy(desc(count(streaks.id)))
        .execute();

      return streak?.streak;
    }),
  list: publicProcedure
    .input(
      z
        .object({ limit: z.number().optional(), offset: z.number().optional() })
        .optional(),
    )
    .output(z.array(streakSelectSchema))
    .query(({ ctx, input }) =>
      ctx.drizzle.query.streaks.findMany({
        ...input,
        where: eq(streaks.user, ctx.user.id),
      }),
    ),

  update: publicProcedure
    .input(
      streakInsertSchema
        .omit({ user: true, completed: true, createdAt: true })
        .partial()
        .extend({ id: streakSelectSchema.shape.id }),
    )
    .output(streakSelectSchema)
    .mutation(async ({ ctx, input: { id, ...input } }) => {
      const completed = Boolean(
        input.steps && input.steps >= ctx.user.profile.steps,
      );

      if (completed)
        await ctx.drizzle
          .insert(rewards)
          .values({ id, type: RewardType.daily_check_in, user: ctx.user.id })
          .onConflictDoNothing();

      const [streak] = await ctx.drizzle
        .update(streaks)
        .set({ ...input, completed })
        .where(and(eq(streaks.id, id), eq(streaks.user, ctx.user.id)))
        .returning()
        .execute();

      if (streak) return streak;

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "streak not updated",
      });
    }),
});
