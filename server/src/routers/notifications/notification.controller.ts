import type z from "zod";
import type { Database } from "../../db";
import type { notificationInsertSchema } from "../../external";
import { notifications } from "../../db/schema";

export const createNotification = (
  db: Database,
  ...values: ({ skip?: boolean } & z.infer<typeof notificationInsertSchema>)[]
) => {
  const data = values.filter((value) => !value.skip);
  if (data.length > 0) return db.insert(notifications).values(data).returning();

  return [];
};
