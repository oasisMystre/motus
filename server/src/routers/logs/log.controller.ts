import { eq, inArray, type SQL } from "drizzle-orm";
import type { Database } from "../../db";
import { meals } from "../../db/schema";

export const getMealLogsWhere = async <T extends SQL>(
  db: Database,
  where?: T,
  options?: {
    limit?: number;
    offset?: number;
  },
) => {
  const allLogs = await db.query.mealLogs
    .findMany({
      where,
      ...options,
    })
    .execute();

  const mealIds = allLogs.flatMap((log) => log.meals);
  const allMeals = await db.query.meals
    .findMany({
      where: inArray(meals.id, mealIds),
    })
    .execute();

  return allLogs.map((log) => ({
    ...log,
    meals: allMeals.filter((meal) => log.meals.find((id) => meal.id === id)),
  }));
};
