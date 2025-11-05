import { writeFileSync } from "fs";
import { and, eq, isNull } from "drizzle-orm";

import rewardList from "./seed/rewards.json";
import muscleList from "./seed/muscles.json";
import exerciseList from "./seed/exercises.json";
import equipmentList from "./seed/equipments.json";

import { db } from "../src/instances";
import type { Database } from "../src/db";
import { exerciseInsertSchema } from "../src/external";
import { getRoutinesWhere } from "../src/routers/routines/routine.controller";
import {
  equipments,
  exercises,
  muscles,
  rewardTypes,
  routines,
} from "../src/db/schema";

async function main(db: Database) {
  const dbMuscles = await db
    .insert(muscles)
    .values(muscleList)
    .onConflictDoUpdate({ target: muscles.name, set: { name: muscles.name } })
    .returning()
    .execute();

  const dbEquipments = await db
    .insert(equipments)
    .values(equipmentList)
    .onConflictDoUpdate({
      target: equipments.name,
      set: { name: equipments.name },
    })
    .returning()
    .execute();

  await db
    .insert(exercises)
    .values(
      exerciseList.map((exercise) => {
        const other_muscles = dbMuscles
          .filter((muscle) =>
            exercise.otherMuscles.find((value) => value === muscle.name),
          )
          .map((muscle) => muscle.id);
        const primary_muscle_group = dbMuscles.find(
          (muscle) => exercise.primaryMuscleGroup === muscle.name,
        )!.id;
        const equipment = dbEquipments.find(
          (equipment) => exercise.equipment === equipment.name,
        )!.id;

        return exerciseInsertSchema.parse({
          ...exercise,
          equipment,
          other_muscles,
          primary_muscle_group,
          metadata: {},
        });
      }),
    )
    .onConflictDoUpdate({
      target: [exercises.user, exercises.name],
      set: { name: exercises.name },
    });
  await db.delete(rewardTypes).execute();
  const dbRewardTypes = Object.fromEntries(
    await Promise.all(
      rewardList.map(async (reward, id) => {
        const [rewardType] = await db
          .insert(rewardTypes)
          .values({ ...reward, id })
          .onConflictDoUpdate({ target: rewardTypes.title, set: reward })
          .returning()
          .execute();
        if (rewardType)
          return [reward.title.split(/\s/g).join("_"), rewardType.id] as const;
        throw new Error("reward type not created");
      }),
    ),
  );

  writeFileSync(
    "src/types.ts",
    "export const RewardType = " +
      JSON.stringify(dbRewardTypes, undefined, 2) +
      "as const",
  );
}

main(db);
