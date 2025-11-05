import type z from "zod";
import { format } from "util";
import { router } from "expo-router";
import { useFormikContext } from "formik";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useQuery } from "@tanstack/react-query";
import { Text, View, FlatList } from "react-native";
import type { mealSelectSchema } from "@motus/server";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Button from "../../../../../../components/Button";
import KeyboardView from "../../../../../../components/KeyboardView";
import { MealItem } from "../../../../../../components/meal";
import { useSearch } from "../../../../../../components/SearchInput";
import { Colors } from "../../../../../../constants";
import { useTRPC } from "../../../../../../providers/TRPCProvider";
import { useAppDispatch, useAppSelector } from "../../../../../../store";
import { mealActions, mealSelectors } from "../../../../../../store/meals";

export default function MyFoodScreen() {
  const trpc = useTRPC();
  const { t } = useTranslation();
  const { value } = useSearch();
  const { bottom } = useSafeAreaInsets();

  const [selectedMeals, setSelectedMeals] = useState<
    z.infer<typeof mealSelectSchema>[]
  >([]);
  const { values, setFieldValue } = useFormikContext<{
    metadata: {
      meals: z.infer<typeof mealSelectSchema>[];
    };
  }>();

  const dispatch = useAppDispatch();
  const mealState = useAppSelector((state) => state.meal);
  const meals = mealSelectors.selectAll(mealState);

  const { isSuccess, data } = useQuery(
    trpc.meal.list.queryOptions({ search: value }),
  );

  useEffect(() => {
    if (data) dispatch(mealActions.setMeals(data));

    return () => {
      mealActions.removeAllMeals();
    };
  }, [isSuccess, data]);

  return (
    <KeyboardView style={{ paddingTop: 24, marginBottom: bottom }}>
      <View className="flex-1">
        <FlatList
          style={{ flex: 1 }}
          ListHeaderComponent={() => (
            <View className="gap-y-8 mb-2">
              <Button
                text={t("log.log_meal.create_food_action")}
                onPress={() => router.push("/(create-food)")}
              />
              <Text
                className="font-poppins"
                style={{ color: Colors.grey }}
              >
                {t("log.log_meal.food_title")}
              </Text>
            </View>
          )}
          data={meals}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => {
            const selected = Boolean(
              selectedMeals.find((meal) => meal.id === item.id),
            );

            const energy = item.metadata.nutriments["energy-kcal"];
            const portionSize = item.metadata.portionSize;

            return (
              <MealItem
                selected={selected}
                title={item.name}
                subtitle={format(
                  "%d%s %d%s",
                  energy?.value || "0",
                  energy?.unit || "kcal",
                  portionSize.value,
                  portionSize.unit,
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
        />
        <Button
          text={t("log.log_meal.add_food_action", {
            count: selectedMeals.length,
          })}
          onPress={() => {
            const data = [...values.metadata.meals, ...selectedMeals];
            setFieldValue("meals", data);
            router.dismissTo("/add-meal");
          }}
          style={{ opacity: selectedMeals.length > 0 ? 1 : 0 }}
        />
      </View>
    </KeyboardView>
  );
}
