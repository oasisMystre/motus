import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { RedisStore } from "connect-redis";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import { streamableHttp } from "fastify-mcp";
import {
  initializeApp,
  cert,
  getApps,
  type ServiceAccount,
} from "firebase-admin/app";
import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";

import { getEnv } from "./env";
import { createMcpServer } from "./mcp";
import { createContext } from "./context";
import { createRedis } from "./instances";
import { appRouter, type AppRouter } from "./routers";

const apps = getApps();

if (apps.length === 0) {
  const serviceAccount: ServiceAccount = JSON.parse(
    Buffer.from(getEnv<string>("SERVICE_ACCOUNT"), "base64").toString("utf-8"),
  );
  initializeApp({
    credential: cert(serviceAccount),
  });
}
const store = new RedisStore({ client: createRedis() });

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

// @ts-expect-error
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
