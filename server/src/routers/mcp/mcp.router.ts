import z from "zod/v3";
import { format } from "util";
import { run } from "@openai/agents";

import { publicProcedure, router } from "../../trpc";

export const mcpRouter = router({
  create: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const agent = await ctx.mcpClient.createAgent(undefined, ctx.user.id);
      const response = await run(agent, format('user=%s %s', input.message));

      return response.finalOutput;
    }),
});
