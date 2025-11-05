import { initTRPC } from "@trpc/server";
import { parse, stringify } from "devalue";

import type { Context } from "./context";
import { transformer } from "./external";

const t = initTRPC.context<Context>().create({ transformer });

export const router = t.router;
export const publicProcedure = t.procedure;
