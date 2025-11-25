import type z from "zod";
import type { mealSelectSchema } from "@motus/server";

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
    { value: number; unit: "g" | "kcal" }
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
      const energy =
        meal.metadata.nutriments["energy-kcal"] ??
        meal.metadata.nutriments["energy-kj"] ??
        meal.metadata.nutriments.energy ??
        meal.metadata.nutriments.energy_value;

      const [key] = nutriment.keys.filter(
        (key) => meal.metadata.nutriments[key],
      );
      if (key) {
        const value = meal.metadata.nutriments[key]?.value;
        result[nutriment.value].value += value ?? 0;
        const energyValue =
          result[nutriment.value].value * nutriment.multiplier;
        if (!energy) result.energy.value += energyValue;
      } else if (energy) {
        result.energy.value =
          energy.unit === "kJ" ? energy.value / 4.184 : energy.value;
      }
    }
  }
  return result;
}
