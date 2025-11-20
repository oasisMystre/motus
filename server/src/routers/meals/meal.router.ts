import z from "zod";
import { format } from "util";
import { TRPCError } from "@trpc/server";
import { and, eq, ilike, or, type SQL } from "drizzle-orm";

import { meals } from "../../db/schema";
import { publicProcedure, router } from "../../trpc";
import {
  mealInsertSchema,
  mealSelectSchema,
  paginationSchema,
} from "../../external";

export const mealRouter = router({
  create: publicProcedure
    .input(mealInsertSchema.omit({ user: true }))
    .output(mealSelectSchema)
    .mutation(async ({ ctx, input }) => {
      const [meal] = await ctx.drizzle
        .insert(meals)
        .values({ ...input, user: ctx.user.id })
        .onConflictDoNothing()
        .returning()
        .execute();
      if (meal) return meal;

      throw new TRPCError({ code: "BAD_REQUEST", message: "meal not created" });
    }),
  update: publicProcedure
    .input(
      mealInsertSchema
        .omit({ user: true })
        .partial()
        .extend(mealSelectSchema.pick({ id: true }).shape),
    )
    .output(mealSelectSchema)
    .mutation(async ({ ctx, input }) => {
      const [meal] = await ctx.drizzle
        .update(meals)
        .set(input)
        .where(and(eq(meals.user, ctx.user.id), eq(meals.id, input.id)))
        .returning()
        .execute();
      if (meal) return meal;

      throw new TRPCError({ code: "NOT_FOUND", message: "meal not found" });
    }),
  delete: publicProcedure
    .input(mealSelectSchema.pick({ id: true }))
    .mutation(async ({ ctx, input }) => {
      return ctx.drizzle
        .delete(meals)
        .where(and(eq(meals.user, ctx.user.id), eq(meals.id, input.id)))
        .execute();
    }),
  create_atomic: publicProcedure
    .input(z.array(mealInsertSchema.omit({ user: true })))
    .output(z.array(mealSelectSchema))
    .mutation(async ({ ctx, input }) => {
      return ctx.drizzle
        .insert(meals)
        .values(input)
        .onConflictDoUpdate({
          target: [meals.id],
          set: { metadata: meals.metadata },
        })
        .returning()
        .execute();
    }),
  list: publicProcedure
    .input(
      paginationSchema.extend({ search: z.string().optional() }).optional(),
    )
    .output(z.array(mealSelectSchema))
    .query(async ({ ctx, input: { search, ...input } = {} }) => {
      const where: (SQL<unknown> | undefined)[] = [];

      if (search) {
        const innerWhere = [];
        innerWhere.push(ilike(meals.name, format("%%%s%%", search)));
        innerWhere.push(ilike(meals.brandName, format("%%%s%%", search)));

        where.push(or(...innerWhere));
      }

      return ctx.drizzle.query.meals
        .findMany({
          ...input,
          where: and(eq(meals.user, ctx.user.id), ...where),
        })
        .execute();
    }),
});
