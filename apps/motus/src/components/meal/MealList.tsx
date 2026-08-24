import type z from "zod";
import clsx from "clsx";
import { format } from "util";
import { View, Text, Pressable } from "react-native";
import type { mealSelectSchema } from "@motus/server";

import { Colors } from "../../constants";
import { getEnergy } from "../../utils/get-energy";

type MealListProps = {
  selected: z.infer<typeof mealSelectSchema> | null;
  meals: z.infer<typeof mealSelectSchema>[];
  onSelect: React.Dispatch<
    React.SetStateAction<
      (z.infer<typeof mealSelectSchema> & { index: number }) | null
    >
  >;
};

export function MealList({ meals, onSelect }: MealListProps) {
  return (
    <View>
      {meals.map((meal, index) => {
        const energy = getEnergy(meal);
        const { size, count } = meal.metadata.portion;

        return (
          <Pressable
            key={index}
            className={clsx(
              "flex-row items-center p-2 gap-x-4",
              index < meals.length - 1 && "border-b-1",
            )}
            style={[
              { borderColor: Colors.darkGray },
              index < meals.length - 1 &&
                meals.length > 1 && { borderBottomWidth: 1 },
            ]}
            onPress={() => onSelect({ ...meal, index })}
          >
            <View className="flex-1">
              <Text className="text-white font-poppins-medium">
                {meal.name}
              </Text>
              <View className="flex flex-row">
                <Text
                  className="text-sm font-poppins"
                  style={{ color: Colors.grey }}
                >
                  {format("%d %s", size?.value ?? 0, size.unit ?? "g")}
                  &nbsp;
                  {format("%d %s", energy.value, energy?.unit)}
                </Text>
              </View>
            </View>
            <Text className="text-white font-poppins">x{count}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
