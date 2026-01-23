import type z from "zod";
import { format } from "util";
import { useState } from "react";
import { FlatList } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { mealInsertSchema, mealSelectSchema } from "@motus/server";
import {
  Pressable,
  View,
  Text,
  type GestureResponderEvent,
} from "react-native";

import Button from "../Button";
import { MealItem } from "./MealItem";
import { Colors } from "../../constants";
import { getEnergy } from "../../utils/get-energy";
import { useTRPC } from "../../providers/TRPCProvider";

type MealScanResultProps = {
  meals: z.infer<typeof mealInsertSchema>[];
  onClose: (event: GestureResponderEvent) => void;
  onChange: (
    event: GestureResponderEvent,
    values: z.infer<typeof mealSelectSchema>[],
  ) => void;
};

export function MealScanResult({
  meals,
  onClose,
  onChange,
}: MealScanResultProps) {
  const trpc = useTRPC();
  const { bottom } = useSafeAreaInsets();
  const [selectedMeals, setSelectedMeals] = useState<
    z.infer<typeof mealInsertSchema>[]
  >([...meals]);

  const { mutateAsync, isPending } = useMutation(
    trpc.meal.create_atomic.mutationOptions(),
  );

  return (
    <View style={{ backgroundColor: Colors.darkGray, paddingBottom: bottom }}>
      <View className="px-2">
        <Pressable
          className="p-2"
          onPress={onClose}
        >
          <Text className="text-primary font-poppins">Close</Text>
        </Pressable>
      </View>
      <FlatList
        data={meals}
        style={{ paddingVertical: 16 }}
        renderItem={({ item }) => {
          const selected = Boolean(
            selectedMeals.find((meal) => meal.id === item.id),
          );

          const energy = getEnergy(item);
          const portionSize = item.metadata.portion.size;

          return (
            <MealItem
              selected={selected}
              title={item.name}
              hideActions
              subtitle={format(
                "%d%s %d%s",
                energy.value ?? "0",
                energy.unit ?? "kcal",
                portionSize.value ?? 0,
                portionSize.unit ?? "ml",
              )}
              onPress={() => {
                if (selected)
                  setSelectedMeals((meals) =>
                    meals.filter((meal) => meal.id !== item.id),
                  );
                else setSelectedMeals((meals) => meals.concat([item]));
              }}
            />
          );
        }}
        ListFooterComponent={() => (
          <View
            className="mt-4 flex flex-row items-center justify-between"
            style={{
              paddingHorizontal: 16,
            }}
          >
            <Text className="font-poppins font-bold text-white">
              {selectedMeals.length} Items
            </Text>
            <Button
              text="Log Meal"
              submitting={isPending}
              disabled={isPending || selectedMeals.length < 1}
              onPress={(event) => {
                mutateAsync(meals).then((values) => onChange?.(event, values));
              }}
            />
          </View>
        )}
      />
    </View>
  );
}
