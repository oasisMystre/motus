import { getAuth } from "firebase-admin/auth";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { MCPServerStreamableHttp } from "@openai/agents";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

import { motusMcpClient, db, openai } from "./instances";
import { FirebaseAuthentication } from "./modules/firebase-authentication";

export async function createContext(options: CreateFastifyContextOptions) {
  const auth = getAuth();
  const user = await FirebaseAuthentication.authenticate(auth, options);

  await motusMcpClient.connect();

  return { user, drizzle: db, openai, mcpClient: motusMcpClient };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
