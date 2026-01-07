import z from "zod/v3";
import z4 from "zod";
import { format } from "util";
import { run } from "@openai/agents";
import { zodResponseFormat } from "openai/helpers/zod";
import { convertProductToMeal, searchFood } from "@motus/openfoodfacts";

import { mealSelectSchema } from "../../db/zod";
import { publicProcedure, router } from "../../trpc";

const mealOutputSchema = z.object({ meals: z.array(z.string()) });

export const mcpRouter = router({
  create: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const agent = await ctx.mcpClient.createAgent(undefined, ctx.user.id);
      const response = await run(agent, format("user=%s %s", input.message));

      return response.finalOutput;
    }),
  scanMeal: publicProcedure
    .input(z4.object({ image: z4.base64() }))
    .output(z4.array(mealSelectSchema))
    .mutation(async ({ ctx, input }) => {
      const prompt =
        "Identify the food/meal ingredients or name in the image. Return ONLY a JSON array of meal/food names. Strict JSON, no markdown.";
      const response = await ctx.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        response_format: zodResponseFormat(mealOutputSchema, "meals"),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${input.image}`,
                  detail: "auto",
                },
              },
            ],
          },
        ],
      });

      const meals = Array.from(
        new Set(
          response.choices.flatMap((choice) => {
            const content = mealOutputSchema.safeParse(
              JSON.parse(choice.message.content!),
            );
            if (content.data) return content.data.meals;
            return [];
          }),
        ),
      );

      const result = (await searchFood(meals.join(","))).products.map(
        convertProductToMeal,
      ) as unknown as z4.infer<typeof mealSelectSchema>[];

      return result;
    }),
});
