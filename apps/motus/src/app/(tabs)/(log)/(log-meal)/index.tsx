import type z from "zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import type { mealLogSelectSchema } from "@motus/server";
import { ActivityIndicator, Text, View, FlatList } from "react-native";

import { Colors } from "../../../../constants";
import HotMeal from "../../../../assets/hot-meal";
import Button from "../../../../components/Button";
import { useTRPC } from "../../../../providers/TRPCProvider";
import SearchInput from "../../../../components/SearchInput";
import KeyboardView from "../../../../components/KeyboardView";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { logActions, mealLogSelector } from "../../../../store/log";
import { MealLogItem, MealLogItemMenu } from "../../../../components/meal";

export default function LogMealScreen() {
  const trpc = useTRPC();
  const [search, setSearch] = useState<string>();
  const [meal, setMeal] = useState<z.infer<typeof mealLogSelectSchema> | null>(
    null,
  );

  const dispatch = useAppDispatch();
  const mealLogState = useAppSelector((state) => state.log.meal);
  const meals = mealLogSelector.selectAll(mealLogState);

  const { isSuccess, isPending, data } = useQuery(
    trpc.log.meal.list.queryOptions({ search }),
  );

  useEffect(() => {
    if (data) dispatch(logActions.setMealLogs(data));
  }, [isSuccess, data]);

  return (
    <>
      <KeyboardView>
        <View className="flex-1 gap-y-16">
          <SearchInput
            inputAttrs={{
              placeholder: "Search meals",
              onChangeText: setSearch,
            }}
          />
          <FlatList
            data={meals}
            contentContainerStyle={{ flexGrow: 1 }}
            ListEmptyComponent={() => {
              if (isPending)
                return (
                  <ActivityIndicator
                    color="white"
                    style={{ flex: 1 }}
                  />
                );

              return (
                <View className="items-center justify-center gap-y-6 mt-48">
                  <View className="gap-y-4 items-center">
                    <HotMeal className="m-auto" />
                    <View className="items-center justify-center">
                      <Text className="text-lg text-white font-poppins-medium">
                        Meals
                      </Text>
                      <Text
                        className="font-poppins"
                        style={{ color: Colors.grey }}
                      >
                        Create a meal log for foods you eat
                      </Text>
                    </View>
                  </View>
                  <Button
                    text="Create meal log"
                    style={{ paddingVertical: 8, paddingHorizontal: 16 }}
                    onPress={() => router.push("/(add-meal)")}
                  />
                </View>
              );
            }}
            ListHeaderComponent={() =>
              meals.length > 0 && (
                <View className="gap-y-8 mb-2">
                  <Button
                    text="Create meal log"
                    onPress={() => router.push("/(add-meal)")}
                  />
                  <Text
                    className="text-lg font-poppins-medium"
                    style={{ color: Colors.grey }}
                  >
                    My meals
                  </Text>
                </View>
              )
            }
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <MealLogItem
                meal={item}
                onMenu={() => setMeal(item)}
              />
            )}
          />
        </View>
      </KeyboardView>
      {meal && (
        <MealLogItemMenu
          meal={meal}
          onClose={() => setMeal(null)}
        />
      )}
    </>
  );
}
