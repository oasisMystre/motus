import z from "zod";
import { format } from "util";
import { TRPCError } from "@trpc/server";
import { and, eq, ilike, or, type SQL } from "drizzle-orm";

import { RewardType } from "../../types";
import { publicProcedure, router } from "../../trpc";
import { rewards, routineLogs } from "../../db/schema";
import {
  paginationSchema,
  routineLogInsertSchema,
  routineLogSelectSchema,
} from "../../db/zod";

export const routineLogRouter = router({
  create: publicProcedure
    .input(routineLogInsertSchema.omit({ user: true }))
    .output(routineLogSelectSchema)
    .mutation(async ({ ctx, input }) => {
      const [[routine]] = await Promise.all([
        ctx.drizzle
          .insert(routineLogs)
          .values({ ...input, user: ctx.user.id })
          .returning()
          .execute(),
        ctx.drizzle
          .insert(rewards)
          .values({ type: RewardType.workout_logged, user: ctx.user.id }),
      ]);

      if (routine) return routine;

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
          filter: routineLogSelectSchema.pick({}).optional(),
        })
        .optional(),
    )
    .output(z.array(routineLogSelectSchema))
    .query(({ ctx, input }) => {
      const where: (SQL | undefined)[] = [];

      if (input?.search) {
        const innerWhere: SQL[] = [];
        innerWhere.push(
          ilike(routineLogs.name, format("%%%s%%", input.search)),
        );

        where.push(or(...innerWhere));
      }

      return ctx.drizzle.query.routineLogs.findMany({
        limit: input?.limit,
        offset: input?.offset,
        where: and(...where, eq(routineLogs.user, ctx.user.id)),
      });
    }),
  retrieve: publicProcedure
    .input(routineLogSelectSchema.pick({ id: true }))
    .output(routineLogSelectSchema)
    .query(async ({ ctx, input }) => {
      const log = await ctx.drizzle.query.routineLogs
        .findFirst({
          where: and(
            eq(routineLogs.user, ctx.user.id),
            eq(routineLogs.id, input.id),
          ),
        })
        .execute();

      if (log) return log;
      throw new TRPCError({ code: "NOT_FOUND", message: "log not found" });
    }),
});
