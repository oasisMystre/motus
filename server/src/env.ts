import "dotenv/config";

import { format } from "util";

type Env =
  | "PORT"
  | "HOST"
  | "REDIS_URL"
  | "MCP_SERVER_URL"
  | "DATABASE_URL"
  | "OPEN_API_KEY"
  | "SECRET_KEY"
  | "SERVICE_ACCOUNT";

export const getEnv = <T extends object | number | string | null = string>(
  name: Env,
  refine?: <K>(value: K) => T,
) => {
  const value = process.env["APP_" + name] || process.env[name];
  if (value)
    try {
      const parsed = JSON.parse(value) as T;
      return refine ? (refine(parsed) as T) : parsed;
    } catch {
      return (refine ? refine(value) : value) as T;
    }
  throw new Error(format("%s not found in env file", name));
};
