import type z from "zod";
import clsx from "clsx";
import { format } from "util";
import { View, Text } from "react-native";
import type { mealSelectSchema } from "@motus/server";

import { Colors } from "../../constants";

type MealListProps = {
  meals: z.infer<typeof mealSelectSchema>[];
};

export function MealList({ meals }: MealListProps) {
  return (
    <View>
      {meals.map((meal, index) => {
        const energy = meal.metadata.nutriments["energy-kcal"];
        const portionSize = meal.metadata.portionSize;

        return (
          <View
            key={index}
            className={clsx(
              "flex-row items-center p-2",
              index < meals.length - 1 && "border-b-1",
            )}
            style={[
              { borderColor: Colors.darkGray },
              index < meals.length - 1 &&
                meals.length > 1 && { borderBottomWidth: 1 },
            ]}
          >
            <View className="flex-1">
              <Text className="text-white font-poppins-medium">
                {meal.name}
              </Text>
              <Text
                className="text-sm font-poppins"
                style={{ color: Colors.grey }}
              >
                {format("%d %s", portionSize.value, portionSize.unit)}
              </Text>
            </View>
            <Text
              className="font-poppins"
              style={{ color: Colors.grey }}
            >
              {format("%d %s", energy.value, energy.unit)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
