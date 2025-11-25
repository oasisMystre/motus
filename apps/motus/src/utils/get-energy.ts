import type z from "zod";
import type { Product } from "@openfoodfacts/openfoodfacts-nodejs";
import type { mealInsertSchema, mealSelectSchema } from "@motus/server";

export function getEnergyFromMeal(
  meal: Pick<
    z.infer<typeof mealSelectSchema> | z.infer<typeof mealSelectSchema>,
    "metadata"
  >,
) {
  const defaultValue =
    meal.metadata.nutriments["energy-kcal"] ??
    meal.metadata.nutriments["energy-kj"] ??
    meal.metadata.nutriments.energy ??
    meal.metadata.nutriments.energy_value;

  if (defaultValue)
    return defaultValue as unknown as { value: number; unit: "kJ" | "kcal" };

  const nutriments: {
    multiplier: number;
    keys: string[];
  }[] = [
    { keys: ["proteins"], multiplier: 4 },
    { keys: ["fat", "saturated-fat"], multiplier: 9 },
    { keys: ["carbohydrates", "carbohydrates-total"], multiplier: 4 },
  ];

  const value = nutriments.reduce((acc, cur) => {
    const [key] = cur.keys.filter((key) => meal.metadata.nutriments[key]);
    const value = meal.metadata.nutriments[key]?.value;
    return acc + (value ?? 0) * cur.multiplier;
  }, 0);

  return { value, unit: "kcal" } as const;
}
export function getEnergyFromProduct(product: Pick<Product, "nutriments">) {
  const defaultValue =
    product.nutriments?.["energy-kcal"] ??
    product.nutriments?.["energy-kj"] ??
    product.nutriments?.energy ??
    product.nutriments?.energy_value;

  const defaultUnit = product.nutriments?.energy_unit ?? "kcal";

  if (defaultValue) return { value: defaultValue, unit: defaultUnit } as const;

  const nutriments: {
    multiplier: number;
    keys: string[];
  }[] = [
    { keys: ["proteins"], multiplier: 4 },
    { keys: ["fat", "saturated-fat"], multiplier: 9 },
    { keys: ["carbohydrates", "carbohydrates-total"], multiplier: 4 },
  ];

  const value = nutriments.reduce((acc, cur) => {
    const [key] = cur.keys.filter(
      (key) => product.nutriments?.[key as keyof Product["nutriments"]],
    );
    const value = product.nutriments?.[key as keyof Product["nutriments"]];
    return acc + (value || 0) * cur.multiplier;
  }, 0);

  return { value, unit: "kcal" } as const;
}

export function getEnergy(
  meal: Pick<
    z.infer<typeof mealSelectSchema> | z.infer<typeof mealInsertSchema>,
    "metadata"
  >,
): {
  value: number;
  unit: "kcal" | "kJ";
};
export function getEnergy(product: Pick<Product, "nutriments">): {
  value: number;
  unit: "kcal" | "kJ";
};
export function getEnergy(
  value:
    | Pick<Product, "nutriments">
    | Pick<
        z.infer<typeof mealSelectSchema> | z.infer<typeof mealInsertSchema>,
        "metadata"
      >,
): {
  value: number;
  unit: "kcal" | "kJ";
} {
  if ("nutriments" in value) return getEnergyFromProduct(value);
  else if ("metadata" in value) return getEnergyFromMeal(value);
  throw new Error("unsupported value");
}
