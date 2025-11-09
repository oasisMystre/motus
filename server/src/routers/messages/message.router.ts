import z from "zod";
import { format } from "util";
import { eq } from "drizzle-orm";
import { run } from "@openai/agents";

import { messages } from "../../db/schema";
import { __srcdir } from "../../instances";
import { publicProcedure, router } from "../../trpc";
import {
  messageInsertSchema,
  messageSelectSchema,
  paginationSchema,
} from "../../external";

export const messageRouter = router({
  create: publicProcedure
    .input(messageInsertSchema.omit({ user: true, role: true }))
    .output(z.array(messageSelectSchema))
    .mutation(async ({ ctx, input }) => {
      let context = [
        {
          role: "user" as const,
          content: format('user=%s %s', ctx.user.id, input.content),
          createdAt: new Date(),
        },
      ];

      context = context.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );

      const agent = await ctx.mcpClient.createAgent(undefined,  ctx.user.id);
      console.log( context.map((context) => ({
        role: context.role,
        content: context.content,
      })))
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
