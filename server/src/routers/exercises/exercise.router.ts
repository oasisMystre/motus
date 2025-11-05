import z from "zod";
import { format } from "util";
import { TRPCError } from "@trpc/server";
import { and, eq, ilike, isNull, or, type SQL } from "drizzle-orm";

import { publicProcedure, router } from "../../trpc";
import { getExercisesWhere } from "./exercise.controller";
import { equipments, exercises, muscles } from "../../db/schema";
import {
  equipmentSelectSchema,
  exerciseInsertSchema,
  exerciseSelectSchema,
  muscleSelectSchema,
  paginationSchema,
} from "../../db/zod";

export const exerciseRouter = router({
  create: publicProcedure
    .input(exerciseInsertSchema.omit({ user: true }))
    .output(exerciseSelectSchema)
    .mutation(async ({ ctx, input }) => {
      const [createdExercise] = await ctx.drizzle
        .insert(exercises)
        .values({ ...input, user: ctx.user.id })
        .returning()
        .execute();

      if (createdExercise) {
        const [exercise] = await getExercisesWhere(
          ctx.drizzle,
          eq(exercises.id, createdExercise.id),
          { limit: 1 },
        );
        if (exercise) return exercise;
      }

      throw new TRPCError({ code: "PARSE_ERROR" });
    }),
  list: publicProcedure
    .input(
      paginationSchema
        .extend({
          search: z.string().optional(),
          filter: z
            .object({
              muscle: muscleSelectSchema.shape.id.optional(),
              equipment: equipmentSelectSchema.shape.id.optional(),
            })
            .optional(),
        })
        .optional(),
    )
    .output(
      z.object({
        custom: z.array(exerciseSelectSchema),
        default: z.array(exerciseSelectSchema),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: (SQL | undefined)[] = [];

      if (input) {
        if (input.filter) {
          const innerWhere = [];

          if (input.filter.muscle)
            innerWhere.push(eq(muscles.id, input.filter.muscle));
          if (input.filter.equipment)
            innerWhere.push(eq(equipments.id, input.filter.equipment));
          where.push(and(...innerWhere));
        }
        if (input.search) {
          const innerWhere = [];
          innerWhere.push(ilike(muscles.name, format("%%%s%%", input.search)));
          innerWhere.push(
            ilike(exercises.name, format("%%%s%%", input.search)),
          );
          innerWhere.push(
            ilike(equipments.name, format("%%%s%%", input.search)),
          );

          where.push(or(...innerWhere));
        }
      }

      const _default = await getExercisesWhere(
        ctx.drizzle,
        and(isNull(exercises.user), ...where),
        input,
      );
      const custom = await getExercisesWhere(
        ctx.drizzle,
        and(eq(exercises.user, ctx.user.id), ...where),
        input,
      );

      return { default: _default, custom };
    }),
  update: publicProcedure
    .input(exerciseInsertSchema.omit({ user: true }).partial())
    .output(exerciseSelectSchema)
    .mutation(async ({ ctx, input }) => {
      const [updatedxercise] = await ctx.drizzle
        .update(exercises)
        .set(input)
        .where(
          and(eq(exercises.id, input.id!), eq(exercises.user, ctx.user.id)),
        )
        .returning()
        .execute();

      if (updatedxercise) {
        const [exercise] = await getExercisesWhere(
          ctx.drizzle,
          eq(exercises.id, updatedxercise.id),
          { limit: 1 },
        );
        if (exercise) return exercise;
      }

      throw new TRPCError({ code: "NOT_FOUND", message: "exercise not found" });
    }),
});
