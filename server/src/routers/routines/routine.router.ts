import z from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { routines } from "../../db/schema";
import { publicProcedure, router } from "../../trpc";
import { getRoutinesWhere } from "./routine.controller";
import { routineInsertSchema, routineSelectSchema } from "../../db/zod";

export const routineRouter = router({
  create: publicProcedure
    .input(routineInsertSchema.omit({ user: true }))
    .output(routineSelectSchema)
    .mutation(async ({ ctx, input }) => {
      const [createdRoutine] = await ctx.drizzle
        .insert(routines)
        .values({
          ...input,
          user: ctx.user.id,
        })
        .returning()
        .execute();

      if (createdRoutine) {
        const [routine] = await getRoutinesWhere(
          ctx.drizzle,
          eq(routines.id, createdRoutine.id),
          { limit: 1 },
        );

        if (routine) return routine;
      }

      throw new TRPCError({ code: "PARSE_ERROR" });
    }),
  list: publicProcedure
    .input(
      z
        .object({ limit: z.number().optional(), offset: z.number().optional() })
        .optional(),
    )
    .output(z.array(routineSelectSchema))
    .query(async ({ ctx, input }) => {
      return getRoutinesWhere(
        ctx.drizzle,
        and(eq(routines.user, ctx.user.id), isNull(routines.previous)),
        input,
      );
    }),
  retrieve: publicProcedure
    .input(routineSelectSchema.pick({ id: true }))
    .output(routineSelectSchema)
    .query(async ({ ctx, input }) => {
      const [routine] = await getRoutinesWhere(
        ctx.drizzle,
        eq(routines.id, input.id!),
        { limit: 1 },
      );

      if (routine) return routine;

      throw new TRPCError({ code: "NOT_FOUND", message: "routine not found" });
    }),
  update: publicProcedure
    .input(routineInsertSchema.omit({ user: true }).partial())

    .output(routineSelectSchema)
    .mutation(async ({ ctx, input }) => {
      const [updatedRoutine] = await ctx.drizzle
        .update(routines)
        .set(input)
        .where(and(eq(routines.id, input.id!), eq(routines.user, ctx.user.id)))
        .returning()
        .execute();

      if (updatedRoutine) {
        const [routine] = await getRoutinesWhere(
          ctx.drizzle,
          eq(routines.id, updatedRoutine.id),
          { limit: 1 },
        );

        if (routine) return routine;

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "routine not found",
        });
      }

      throw new TRPCError({
        code: "NOT_FOUND",
        message: "routine not updated",
      });
    }),
  delete: publicProcedure
    .input(routineSelectSchema.pick({ id: true }))
    .mutation(async ({ ctx, input }) =>
      ctx.drizzle
        .delete(routines)
        .where(and(eq(routines.user, ctx.user.id), eq(routines.id, input.id)))
        .execute(),
    ),
});
