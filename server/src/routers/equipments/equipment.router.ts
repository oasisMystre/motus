import z from "zod";
import { publicProcedure, router } from "../../trpc";
import { equipmentSelectSchema } from "../../external";

export const equipmentRouter = router({
  list: publicProcedure
    .input(
      z
        .object({ limit: z.number().optional(), offset: z.number().optional() })
        .optional(),
    )
    .output(z.array(equipmentSelectSchema))
    .query(({ ctx, input }) => ctx.drizzle.query.equipments.findMany(input)),
});
