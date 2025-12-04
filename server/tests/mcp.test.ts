import z from "zod/v3";
import { zodResponseFormat } from "openai/helpers/zod";
import { describe, beforeAll, test, afterAll } from "bun:test";
import {
  MCPServerStreamableHttp,
  setDefaultOpenAIKey,
  setTracingExportApiKey,
} from "@openai/agents";

import { getEnv } from "../src/env";
import { openai } from "../src/instances";
import { McpClient } from "../src/mcp/client";

setDefaultOpenAIKey(getEnv("OPEN_API_KEY"));
setTracingExportApiKey(getEnv("OPEN_API_KEY"));

describe("mcp", () => {
  let client: McpClient;
  let transport: MCPServerStreamableHttp;

  beforeAll(async () => {
    transport = new MCPServerStreamableHttp({
      url: getEnv("MCP_SERVER_URL"),
    });

    client = new McpClient(transport, {
      name: "RhivaAg",
    });
  });

  afterAll(async () => {
    await client.close();
  });

  test("get tokens", async () => {
    const _agent = await client.createAgent(
      undefined,
      "4e3a430c-022a-45a2-ab1c-24bae2dc48eb",
    );

    const prompt =
      "Identify the food/meal ingredients or name in the image. Return ONLY a JSON array of meal/food names. Strict JSON, no markdown.";
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: zodResponseFormat(
        z.object({ meals: z.array(z.string()) }),
        "meals",
      ),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `https://pqhonwobj3.ufs.sh/f/wyD68i2cCLs0hNlOCdtg0SARkXUEZH4CfVwBrl1Q6iD8T7ec`,
                detail: "auto",
              },
            },
          ],
        },
      ],
    });

  });
});
