import z from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, sum } from "drizzle-orm";

import { RewardType } from "../../types";
import { rewardSelectSchema } from "../../external";
import { publicProcedure, router } from "../../trpc";
import { rewards, rewardTypes } from "../../db/schema";

export const rewardRouter = router({
  aggregrate: publicProcedure
    .output(z.object({ points: z.number(), newUserReward: rewardSelectSchema }))
    .query(async ({ ctx }) => {
      const newUserReward = await ctx.drizzle.query.rewards.findFirst({
        with: {
          type: true,
        },
        columns: {
          type: false,
        },
        where: and(
          eq(rewards.user, ctx.user.id),
          eq(rewards.type, RewardType.new_user_rewards),
        ),
      });

      const [points] = await ctx.drizzle
        .select({ user: rewards.user, points: sum(rewardTypes.point) })
        .from(rewards)
        .groupBy(rewards.user)
        .innerJoin(rewardTypes, eq(rewardTypes.id, rewards.type))
        .where(eq(rewards.user, ctx.user.id))
        .execute();
      if (points && points.points && newUserReward)
        return { points: parseFloat(points.points), newUserReward };

      throw new TRPCError({
        code: "NOT_FOUND",
        message: "points for user not found",
      });
    }),
  list: publicProcedure
    .input(
      z
        .object({ limit: z.number().optional(), offset: z.number().optional() })
        .optional(),
    )
    .output(z.array(rewardSelectSchema))
    .query(({ ctx, input }) =>
      ctx.drizzle.query.rewards.findMany({
        ...input,
        with: { type: true },
        columns: { type: false },
        orderBy: desc(rewards.createdAt),
        where: eq(rewards.user, ctx.user.id),
      }),
    ),
});
