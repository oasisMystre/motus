import { fastifyCookie } from "@fastify/cookie";
import { fastifySession } from "@fastify/session";
import { fastifySecureSession } from "@fastify/secure-session";

declare module "@fastify/secure-session" {
  interface SessionData {
    user: string;
  }
}

declare module "fastify" {
  interface Session {
    "firebase.token"?: string;
  }
}
