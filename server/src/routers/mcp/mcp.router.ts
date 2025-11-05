import z from "zod";
import path from "path";
import { readFileSync } from "fs";
import { run } from "@openai/agents";

import { __srcdir } from "../../instances";
import { publicProcedure, router } from "../../trpc";

export const mcpRouter = router({
  create: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const agent = await ctx.mcpClient.createAgent({
        model: "gpt-4.1-mini",
        outputType: z.object({
          type: z.string(),
        }),
        instructions: readFileSync(
          path.resolve(__srcdir, "src/mcp/prompt.txt"),
          "utf-8",
        ).replace("%userId%", ctx.user.id),
      });

      const response = await run(agent, input.message);

      return response.finalOutput;
    }),
});
