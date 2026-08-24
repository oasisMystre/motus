import type z from "zod";
import type { mealSelectSchema } from "@motus/server";

import { getEnergy } from "./get-energy";

export function getMealInfo(
  ...meals: Pick<
    z.infer<typeof mealSelectSchema> | z.infer<typeof mealSelectSchema>,
    "metadata"
  >[]
) {
  const nutriments: {
    unit: "g";
    keys: string[];
    multiplier: number;
    value: "proteins" | "fats" | "carbohydrates";
  }[] = [
    { value: "proteins", unit: "g", keys: ["proteins"], multiplier: 4 },
    { value: "fats", unit: "g", keys: ["fat", "saturated-fat"], multiplier: 9 },
    {
      unit: "g",
      value: "carbohydrates",
      multiplier: 4,
      keys: ["carbohydrates", "carbohydrates-total"],
    },
  ];

  const result: Record<
    (typeof nutriments)[number]["value"] | "energy",
    { value: number; unit: "g" | "kcal" | "kJ" }
  > = {
    energy: { value: 0, unit: "kcal" },
    ...(Object.fromEntries(
      nutriments.map((nutriment) => [nutriment.value, { value: 0, unit: "g" }]),
    ) as Record<
      (typeof nutriments)[number]["value"],
      { value: number; unit: "g" | "kcal" }
    >),
  };

  for (const meal of meals) {
    for (const nutriment of nutriments) {
      result.energy = getEnergy(meal);

      const [key] = nutriment.keys.filter(
        (key) => meal.metadata.nutriments[key],
      );
      if (key) {
        const value = meal.metadata.nutriments[key]?.value;
        result[nutriment.value].value +=
          (value ?? 0) * meal.metadata.portion.count;
      }
    }
  }
  return result;
}
