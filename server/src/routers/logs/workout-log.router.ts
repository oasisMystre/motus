import z from "zod";
import { format } from "util";
import { TRPCError } from "@trpc/server";
import { and, eq, or, type SQL, ilike } from "drizzle-orm";

import { RewardType } from "../../types";
import { publicProcedure, router } from "../../trpc";
import { rewards, workoutLogs } from "../../db/schema";
import {
  paginationSchema,
  workoutLogInsertSchema,
  workoutLogSelectSchema,
} from "../../db/zod";

export const workoutLogRouter = router({
  create: publicProcedure
    .input(workoutLogInsertSchema.omit({ user: true }))
    .output(workoutLogSelectSchema)
    .mutation(async ({ ctx, input }) => {
      const [[workout]] = await Promise.all([
        ctx.drizzle
          .insert(workoutLogs)
          .values({ ...input, user: ctx.user.id })
          .returning()
          .execute(),
        ctx.drizzle
          .insert(rewards)
          .values({ type: RewardType.workout_logged, user: ctx.user.id }),
      ]);

      if (workout) return workout;

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "log not created",
      });
    }),
  list: publicProcedure
    .input(
      paginationSchema.extend({
        search: z.string().optional(),
        filter: workoutLogSelectSchema.pick({}).optional(),
      }),
    )
    .output(z.array(workoutLogSelectSchema))
    .query(({ ctx, input: { filter, search, ...pagination } }) => {
      const where: (SQL | undefined)[] = [];

      if (search) {
        const innerWhere: SQL[] = [];
        innerWhere.push(ilike(workoutLogs.name, format("%%%s%%", search)));

        where.push(or(...innerWhere));
      }

      return ctx.drizzle.query.workoutLogs.findMany({
        ...pagination,
        where: and(...where),
      });
    }),
  retrieve: publicProcedure
    .input(workoutLogSelectSchema.pick({ id: true }))
    .output(workoutLogSelectSchema)
    .query(async ({ ctx, input }) => {
      const log = await ctx.drizzle.query.workoutLogs
        .findFirst({
          where: eq(workoutLogs.id, input.id),
        })
        .execute();

      if (log) return log;
      throw new TRPCError({ code: "NOT_FOUND", message: "log not found" });
    }),
  update: publicProcedure
    .input(
      workoutLogInsertSchema
        .omit({ user: true })
        .extend({ id: workoutLogSelectSchema.shape.id }),
    )
    .output(workoutLogSelectSchema)
    .mutation(async ({ ctx, input: { id, ...input } }) => {
      const [workout] = await ctx.drizzle
        .update(workoutLogs)
        .set(input)
        .where(and(eq(workoutLogs.user, ctx.user.id), eq(workoutLogs.id, id)))
        .returning()
        .execute();

      if (workout) return workout;

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "log not updated",
      });
    }),
  delete: publicProcedure
    .input(workoutLogSelectSchema.pick({ id: true }))
    .mutation(async ({ ctx, input }) => {
      await ctx.drizzle
        .delete(workoutLogs)
        .where(
          and(eq(workoutLogs.user, ctx.user.id), eq(workoutLogs.id, input.id)),
        )
        .execute();

      return;
    }),
});
