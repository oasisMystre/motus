import z from "zod/v3";

export const agentOutputSchema = z.object({
  summary: z
    .string()
    .optional()
    .nullable()
    .describe("short summary of response."),
});
