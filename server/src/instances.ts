import OpenAI from "openai";
import {
  MCPServerStreamableHttp,
  setDefaultOpenAIKey,
  setTracingExportApiKey,
} from "@openai/agents";

import { getEnv } from "./env";
import { createDB } from "./db";
import { config } from "./mcp/config";
import { McpClient } from "./mcp/client";

setDefaultOpenAIKey(getEnv("OPEN_API_KEY"));
setTracingExportApiKey(getEnv("OPEN_API_KEY"));

export const __srcdir = process.cwd();
export const db = createDB(getEnv("DATABASE_URL"));
export const openai = new OpenAI({ apiKey: getEnv<string>("OPEN_API_KEY") });

const transport = new MCPServerStreamableHttp({
  ...config,
  url: getEnv("MCP_SERVER_URL"),
});
export const motusMcpClient = new McpClient(transport, config);
