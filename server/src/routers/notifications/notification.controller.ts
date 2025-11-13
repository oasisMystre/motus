import type z from "zod";
import type { Database } from "../../db";
import type { notificationInsertSchema } from "../../external";
import { notifications } from "../../db/schema";

export const createNotification = (
  db: Database,
  ...values: ({ skip?: boolean } & z.infer<typeof notificationInsertSchema>)[]
) =>
  db
    .insert(notifications)
    .values(values.filter((value) => !value.skip))
    .returning();
