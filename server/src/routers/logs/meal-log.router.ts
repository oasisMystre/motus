import z from "zod";
import { format } from "util";
import { TRPCError } from "@trpc/server";
import { and, eq, ilike, or, type SQL } from "drizzle-orm";

import { RewardType } from "../../types";
import { getMealLogsWhere } from "./log.controller";
import { publicProcedure, router } from "../../trpc";
import { mealLogs, meals, rewards } from "../../db/schema";
import {
  paginationSchema,
  mealLogInsertSchema,
  mealLogSelectSchema,
} from "../../db/zod";

export const mealLogRouter = router({
  create: publicProcedure
    .input(mealLogInsertSchema.omit({ user: true }))
    .output(mealLogSelectSchema)
    .mutation(async ({ ctx, input }) => {
      const [[createdMeal]] = await Promise.all([
        ctx.drizzle
          .insert(mealLogs)
          .values({ ...input, user: ctx.user.id })
          .returning()
          .execute(),
        ctx.drizzle
          .insert(rewards)
          .values({ type: RewardType.meal_logged, user: ctx.user.id }),
      ]);

      if (createdMeal) {
        const [meal] = await getMealLogsWhere(
          ctx.drizzle,
          eq(meals.id, createdMeal.id),
          { limit: 1 },
        );

        if (meal) return meal;
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "log not created",
      });
    }),
  list: publicProcedure
    .input(
      paginationSchema
        .extend({
          search: z.string().optional(),
          filter: mealLogSelectSchema.pick({}).optional(),
        })
        .optional(),
    )
    .output(z.array(mealLogSelectSchema))
    .query(({ ctx, input }) => {
      const where: (SQL | undefined)[] = [];

      if (input?.search) {
        const innerWhere: SQL[] = [];
        innerWhere.push(ilike(mealLogs.name, format("%%%s%%", input.search)));

        where.push(or(...innerWhere));
      }

      return getMealLogsWhere(
        ctx.drizzle,
        and(...where, eq(mealLogs.user, ctx.user.id)),
        input,
      );
    }),
  retrieve: publicProcedure
    .input(mealLogSelectSchema.pick({ id: true }))
    .output(mealLogSelectSchema)
    .query(async ({ ctx, input }) => {
      const [log] = await getMealLogsWhere(
        ctx.drizzle,
        and(eq(mealLogs.user, ctx.user.id), eq(mealLogs.id, input.id)),
      );

      if (log) return log;
      throw new TRPCError({ code: "NOT_FOUND", message: "log not found" });
    }),

  update: publicProcedure
    .input(
      mealLogInsertSchema
        .omit({ user: true })
        .partial()
        .extend({ id: mealLogSelectSchema.shape.id }),
    )
    .output(mealLogSelectSchema)
    .mutation(async ({ ctx, input: { id, ...input } }) => {
      const [updatedMeal] = await ctx.drizzle
        .update(mealLogs)
        .set(input)
        .where(and(eq(mealLogs.user, ctx.user.id), eq(mealLogs.id, id)))
        .returning()
        .execute();

      if (updatedMeal) {
        const [meal] = await getMealLogsWhere(
          ctx.drizzle,
          eq(meals.id, updatedMeal.id),
          { limit: 1 },
        );

        if (meal) return meal;
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "log not created",
      });
    }),

  delete: publicProcedure
    .input(mealLogSelectSchema.pick({ id: true }))
    .mutation(async ({ ctx, input: { id } }) => {
      await ctx.drizzle
        .delete(mealLogs)
        .where(and(eq(mealLogs.user, ctx.user.id), eq(mealLogs.id, id)))
        .execute();

      return;
    }),
});
