import type z from "zod";
import { inArray, type SQL } from "drizzle-orm";

import type { Database } from "../../db";
import { muscles } from "../../db/schema";
import type { exerciseSelectSchema } from "../../db/zod";

export const getExercisesWhere = async <T extends SQL | undefined>(
  db: Omit<Database, "$client">,
  where: T,
  options?: { limit?: number; offset?: number },
): Promise<z.infer<typeof exerciseSelectSchema>[]> => {
  const exercises = await db.query.exercises
    .findMany({
      ...options,
      where,
      with: { equipment: true, primary_muscle_group: true },
      columns: { equipment: false, primary_muscle_group: false },
    })
    .execute();

  const allMuscles = await db.query.muscles.findMany({
    where: inArray(
      muscles.id,
      exercises.flatMap((exercise) => exercise.other_muscles),
    ),
  });

  return exercises.map((exercise) => {
    return {
      ...exercise,
      other_muscles: allMuscles.filter((muscle) =>
        exercise.other_muscles.find((value) => value === muscle.id),
      ),
    } as unknown as z.infer<typeof exerciseSelectSchema>;
  });
};
