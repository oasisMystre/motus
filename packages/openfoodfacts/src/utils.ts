import { format } from "util";
import type { Product } from "@openfoodfacts/openfoodfacts-nodejs";

export const convertProductToMeal = (
  product: Product,
): {
  id: string;
  productName: string;
  name: string;
  metadata: {
    portionSize: {
      value: number;
      unit: "cup" | "sachet" | "bag" | "litre" | "g" | "kg";
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
