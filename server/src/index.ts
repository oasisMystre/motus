import fastify from "fastify";
import IoRedis from "ioredis";
import fastifyCors from "@fastify/cors";
import { cert } from "firebase-admin/app";
import { RedisStore } from "connect-redis";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import { streamableHttp } from "fastify-mcp";
import { initializeApp } from "firebase-admin/app";
import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";

import { getEnv } from "./env";
import { createMcpServer } from "./mcp";
import { createContext } from "./context";
import { appRouter, type AppRouter } from "./routers";

initializeApp({
  credential: cert(getEnv<string>("SERVICE_ACCOUNT")),
});

const redis = new IoRedis(getEnv<string>("REDIS_URL"));
const store = new RedisStore({ client: redis });

const server = fastify({
  logger: true,
  maxParamLength: 5000,
});

server.register(fastifyCookie);
server.register(fastifyCors, { origin: true, credentials: true });
server.register(fastifySession, {
  store,
  saveUninitialized: false,
  secret: getEnv<string>("SECRET_KEY"),
  cookie: { secure: true, httpOnly: true, sameSite: "lax" },
});

server.register(streamableHttp, {
  stateful: false,
  mcpEndpoint: "/mcp",
  createServer: createMcpServer,
});
server.register(fastifyTRPCPlugin, {
  prefix: "/",
  useWSS: true,
  trpcOptions: {
    createContext,
    router: appRouter,
    onError({ path, error }) {
      server.log.error(error, path);
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
});

server.listen({ port: getEnv<number>("PORT"), host: getEnv<string>("HOST") });
