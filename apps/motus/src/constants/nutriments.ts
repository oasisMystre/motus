import { format } from "util";
import type { Product } from "@openfoodfacts/openfoodfacts-nodejs";

export const nutriments = [
  { name: "Enerygy", key: "energy-kcal", unit: "kcal", required: true },
  { name: "Total Fat", key: "fat", unit: "g", required: false },
  { name: "Saturated Fat", key: "saturated-fat", unit: "g", required: false },
  {
    name: "Polyunsaturated Fat",
    key: "polyunsaturated-fat",
    unit: "g",
    required: false,
  },
  {
    name: "Monosaturated Fat",
    key: "mono-saturated-fat",
    unit: "g",
    required: false,
  },
  { name: "Trans Fat", key: "trans-fat", unit: "g", required: false },
  { name: "Cholesterol", key: "cholesterol", unit: "mg", required: false },
  { name: "Sodium", key: "sodium", unit: "cal", required: false },
  { name: "Potassium", key: "potassium", unit: "mg", required: false },
  {
    name: "Total carbohydrate",
    key: "carbohydrate",
    unit: "g",
    required: false,
  },
  { name: "Dietary Fiber", key: "fiber", unit: "g", required: false },
  { name: "Sugars", key: "sugars", unit: "g", required: false },
  { name: "Added sugars", key: "sugars_servings", unit: "g", required: false },
  {
    name: "Sugar Alcohols",
    key: "sugars-alcohols",
    unit: "g",
    required: false,
  },
  { name: "Proteins", key: "proteins", unit: "g", required: false },
  { name: "Vitamin A", key: "vitamin-a", unit: "%", required: false },
  { name: "Vitamin C", key: "vitamin-c", unit: "%", required: false },
  { name: "Vitamin D", key: "vitamin-d", unit: "%", required: false },
  { name: "Calcium", key: "calcium", unit: "%", required: false },
  { name: "Iron", key: "iron", unit: "%", required: false },
] as const;

export const convertProductToMeal = (
  product: Product,
): {
  id: string;
  productName: string;
  name: string;
  metadata: {
    portionSize: {
      value: number;
      unit: "cup" | "g" | "kg";
    };
    nutriments: {
      [key: string]: { value: number; unit: "g" | "mg" | "%" | "cal" | "kcal" };
    };
  };
} => {
  return {
    id: product.id!,
    productName: product.product_name!,
    name:
      product.abbreviated_product_name! ||
      product.product_name_en! ||
      product.product_name!,
    metadata: {
      portionSize: {
        value: parseFloat(product.serving_quantity!),
        unit: product.serving_quantity_unit! as "g",
      },
      nutriments: Object.fromEntries(
        Object.entries(product.nutriments!)
          .map(([key]) => {
            const isValid = key.split(/_/g).length < 2;

            if (isValid) {
              const unit =
                product.nutriments?.[
                  format("%s_unit", key) as keyof Product["nutriments"]
                ];
              const value =
                product.nutriments?.[
                  format("%s_100g", key) as keyof Product["nutriments"]
                ];

              if (unit && value) return [key, { unit, value }];
            }
          })
          .filter((value) => !!value),
      ),
    },
  };
};
