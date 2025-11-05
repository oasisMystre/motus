import z from "zod";
import path from "path";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";
import { run } from "@openai/agents";

import { messages } from "../../db/schema";
import { __srcdir } from "../../instances";
import { publicProcedure, router } from "../../trpc";
import {
  messageContentSchema,
  messageInsertSchema,
  messageSelectSchema,
  paginationSchema,
} from "../../external";
import { MotusMcpClient } from "../../mcp/client";

export const messageRouter = router({
  create: publicProcedure
    .input(messageInsertSchema.omit({ user: true, role: true }))
    .output(z.array(messageSelectSchema))
    .mutation(async ({ ctx, input }) => {
      let context = [
        {
          role: "user" as const,
          content: input.content,
          createdAt: new Date(),
        },
      ];

      context = context.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );

      const agent = await ctx.mcpClient.createAgent({
        model: "gpt-4.1-mini",
        instructions: readFileSync(
          path.resolve(__srcdir, "src/mcp/prompt.txt"),
          "utf-8",
        ).replace("%userId%", ctx.user.id),
      });

      const response = await run(
        agent,
        context.map((context) => ({
          role: context.role,
          content: context.content,
        })),
      );

      return ctx.drizzle
        .insert(messages)
        .values([
          {
            role: "user",
            user: ctx.user.id,
            content: { type: "text", data: input.content },
          },
          {
            role: "assistant",
            user: ctx.user.id,
            content: { type: "text", data: response.finalOutput as string },
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
