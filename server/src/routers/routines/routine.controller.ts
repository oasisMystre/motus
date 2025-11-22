import { inArray, type SQL } from "drizzle-orm";

import type { Database } from "../../db";
import { exercises, type routines } from "../../db/schema";
import { getExercisesWhere } from "../exercises/exercise.controller";

export const expandRoutines = async <
  T extends Pick<typeof routines.$inferSelect, "id" | "metadata">,
>(
  db: Omit<Database, "$client">,
  routines: T[],
) => {
  const allExercises = await getExercisesWhere(
    db,
    inArray(
      exercises.id,
      routines.flatMap((routine) =>
        routine.metadata.exercises.map((exercise) => exercise.id),
      ),
    ),
  );

  const exercisesMap = new Map(allExercises.map((value) => [value.id, value]));

  return routines.map((routine) => {
    const exercises: ((typeof routine.metadata.exercises)[number] &
      (typeof allExercises)[number])[] = [];
    for (const value of routine.metadata.exercises) {
      const exercise = exercisesMap.get(value.id);
      if (exercise) {
        exercises.push({
          ...value,
          ...exercise,
        });
      }
    }
    return {
      ...routine,
      metadata: {
        ...routine.metadata,
        exercises,
      },
    };
  });
};

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

  const response = await expandRoutines(db, allRoutines);
  console.dir(
    response.map((r) => r.metadata.exercises),
    { depth: null },
  );
  return response;
};
