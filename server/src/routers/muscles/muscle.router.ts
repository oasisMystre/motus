import z from "zod";
import { publicProcedure, router } from "../../trpc";
import { muscleSelectSchema } from "../../external";

export const muscleRouter = router({
  list: publicProcedure
    .input(
      z
        .object({ limit: z.number().optional(), offset: z.number().optional() })
        .optional(),
    )
    .output(z.array(muscleSelectSchema))
    .query(({ ctx, input }) => ctx.drizzle.query.muscles.findMany(input)),
});
