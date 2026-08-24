import OpenAI from "openai";
import type { Redis, RedisOptions } from "ioredis";
import {
  MCPServerStreamableHttp,
  setDefaultOpenAIKey,
  setTracingExportApiKey,
} from "@openai/agents";

import { getEnv } from "./env";
import { createDB } from "./db";
import { createRedis as defaultCreateRedis } from "./redis";

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

export const createRedis = (options?: RedisOptions) => {
  let redis: Redis;

  if (
    "APP_REDIS_MASTER_NAME" in process.env &&
    "APP_REDIS_SENTINEL_PORT" in process.env &&
    "APP_REDIS_SENTINEL_HOSTNAME" in process.env &&
    "APP_REDIS_PASSWORD" in process.env
  )
    redis = defaultCreateRedis({
      name: getEnv("REDIS_MASTER_NAME"),
      port: getEnv("REDIS_SENTINEL_PORT", Number),
      host: getEnv("REDIS_SENTINEL_HOSTNAME"),
      password: getEnv("REDIS_PASSWORD"),
      ...options,
    });
  else if (options)
    redis = defaultCreateRedis(getEnv("REDIS_URL"), {
      password: getEnv("REDIS_PASSWORD"),
      ...options,
    });
  else redis = defaultCreateRedis(getEnv("REDIS_URL"));

  return redis;
};
