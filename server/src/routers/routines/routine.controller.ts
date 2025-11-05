import { inArray, type SQL } from "drizzle-orm";

import type { Database } from "../../db";
import { exercises } from "../../db/schema";
import { getExercisesWhere } from "../exercises/exercise.controller";

export const getRoutinesWhere = async <T extends SQL | undefined>(
  db: Database,
  where: T,
  options?: { limit?: number; offset?: number },
) => {
  const allRoutines = await db.query.routines
    .findMany({
      where,
      with: {
        previous: {
          columns: {
            previous: false,
          },
        },
      },
      columns: { previous: false },
      ...options,
    })
    .execute();

  const allExercises = await getExercisesWhere(
    db,
    inArray(
      exercises.id,
      allRoutines.flatMap((routine) =>
        routine.metadata.exercises.map((exercise) => exercise.id),
      ),
    ),
  );

  return allRoutines.map((routine) => {
    return {
      ...routine,
      metadata: {
        ...routine.metadata,
        exercises: routine.metadata.exercises.map((exercise) => ({
          ...exercise,
          ...allExercises.find((value) => value.id === exercise.id)!,
        })),
      },
    };
  });
};
