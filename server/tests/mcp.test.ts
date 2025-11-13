import path from "path";
import { readFileSync } from "fs";
import { describe, beforeAll, test, afterAll } from "bun:test";
import {
  MCPServerStreamableHttp,
  run,
  setDefaultOpenAIKey,
  setTracingExportApiKey,
} from "@openai/agents";

import { getEnv } from "../src/env";
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
    const agent = await client.createAgent(
      undefined,
      "4e3a430c-022a-45a2-ab1c-24bae2dc48eb",
    );

    const response = await run(
      agent,
      '{"user": "4e3a430c-022a-45a2-ab1c-24bae2dc48eb",",questions":{"weight":[{"question":"What are your reasons for wanting to gain weight","answer":[{"name":"Gain muscle for general fitness"}]},{"question":"What is your weekly goal","answer":[{"name":"Loss 0.5kg per week"}]}]}} update-goal',
    );
    console.log(response.finalOutput, { depth: null });
  });
});
