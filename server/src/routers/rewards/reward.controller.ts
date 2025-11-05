import type z from "zod";

import type { Database } from "../../db";
import { rewards } from "../../db/schema";
import type { rewardInsertSchema } from "../../external";

export const createReward = (
  db: Database,
  value: z.infer<typeof rewardInsertSchema>,
) =>
  db.insert(rewards).values(value).onConflictDoNothing().returning().execute();
