import z from "zod";
import { eq } from "drizzle-orm";

import { notifications } from "../../db/schema";
import { publicProcedure, router } from "../../trpc";
import { notificationSelectSchema } from "../../external";

export const notificationRouter = router({
  list: publicProcedure
    .output(z.array(notificationSelectSchema))
    .query(async ({ ctx }) => {
      return ctx.drizzle.query.notifications.findMany({
        where: eq(notifications.user, ctx.user.id),
      });
    }),
});
