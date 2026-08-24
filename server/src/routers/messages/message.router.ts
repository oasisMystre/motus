import type z from "zod/v3";
import z4 from "zod";
import { format } from "util";
import { eq } from "drizzle-orm";
import { run } from "@openai/agents";

import { messages } from "../../db/schema";
import { publicProcedure, router } from "../../trpc";
import {
  messageInsertSchema,
  messageSelectSchema,
  paginationSchema,
} from "../../external";
import type { agentOutputSchema } from "../../mcp/schema";

export const messageRouter = router({
  create: publicProcedure
    .input(messageInsertSchema.omit({ user: true, role: true }))
    .output(z4.array(messageSelectSchema))
    .mutation(async ({ ctx, input }) => {
      let context = [
        {
          role: "user" as const,
          content: format("user=%s %s", ctx.user.id, input.content),
          createdAt: new Date(),
        },
      ];

      context = context.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );

      const agent = await ctx.mcpClient.createAgent(undefined, ctx.user.id);
      const response = await run(
        agent,
        context.map((context) => ({
          role: context.role,
          content: context.content,
        })),
      );
      const finalOutput = response.finalOutput as z.infer<
        typeof agentOutputSchema
      >;

      return ctx.drizzle
        .insert(messages)
        .values([
          {
            id: input.id,
            role: "user",
            user: ctx.user.id,
            content: { type: "text", data: input.content },
          },
          {
            role: "assistant",
            user: ctx.user.id,
            content: { type: "text", data: finalOutput.summary! },
          },
        ])
        .returning()
        .execute();
    }),
  list: publicProcedure
    .input(paginationSchema.optional())
    .query(({ ctx, input }) =>
      ctx.drizzle.query.messages.findMany({
        ...input,
        orderBy: messages.createdAt,
        where: eq(messages.user, ctx.user.id),
      }),
    ),
});
