import clsx from "clsx";
import type z from "zod";
import { format } from "util";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { mealSelectSchema } from "@motus/server";
import { ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type NativeSyntheticEvent, Text, View, FlatList } from "react-native";

import Button from "../Button";
import { MealItem } from "./MealItem";
import { Colors } from "../../constants";
import { useSearch } from "../SearchInput";
import IcMeal from "../../assets/hot-meal";
import CreateFoodModal from "./CreateFoodModal";
import { getEnergy } from "../../utils/get-energy";
import CrudListItemMenu from "../CrudListItemMenu";
import { useTRPC } from "../../providers/TRPCProvider";
import { MealConfirmDeletion } from "./MealConfirmDeletion";

type FoodModalProps = {
  values: z.infer<typeof mealSelectSchema>[];
  onRequestClose?: (ev?: NativeSyntheticEvent<any>) => void;
  onChange: (values: z.infer<typeof mealSelectSchema>[]) => void;
} & React.ComponentProps<typeof View>;

export default function FoodUserTab({
  values,
  onChange,
  ...props
}: FoodModalProps) {
  const trpc = useTRPC();
  const { t } = useTranslation();
  const { value } = useSearch();
  const { bottom } = useSafeAreaInsets();
  const [showDeleteFoodModal, setShowDeleteFoodModal] = useState(false);
  const [showCreateFoodModal, setShowCreateFoodModal] = useState(false);
  const [selectedMeals, setSelectedMeals] = useState<
    z.infer<typeof mealSelectSchema>[]
  >([]);
  const [menuFocusedItem, setMenuFocusedItem] = useState<
    z.infer<typeof mealSelectSchema> | undefined
  >(undefined);
  const [selectedMeal, setSelectedMeal] = useState<
    z.infer<typeof mealSelectSchema> | undefined
  >(undefined);

  const { data, isFetching, refetch, isRefetching } = useQuery(
    trpc.meal.list.queryOptions({ search: value }),
  );

  return (
    <>
      <View
        className={clsx("flex-1 mt-4", props.className)}
        {...props}
      >
        <FlatList
          data={data}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              onRefresh={refetch}
              refreshing={isRefetching}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
              progressBackgroundColor="white"
            />
          }
          ListHeaderComponent={() => (
            <View
              className="gap-y-8 mb-2"
              style={{ paddingHorizontal: 16 }}
            >
              <Button
                text={t("log.log_meal.create_food_action")}
                onPress={() => setShowCreateFoodModal(true)}
              />
              <Text
                className="font-poppins"
                style={{ color: Colors.grey }}
              >
                {t("log.log_meal.food_title")}
              </Text>
            </View>
          )}
          ListEmptyComponent={() => {
            if (isFetching)
              return (
                <ActivityIndicator
                  color="white"
                  className="m-auto"
                />
              );

            return (
              <View className="flex-1 flex flex-col items-center justify-center space-y-4">
                <IcMeal
                  width={72}
                  height={72}
                />
                <View className="flex flex-col items-center justify-center">
                  <Text className="text-lg text-white font-poppins-medium">
                    No Created Meal
                  </Text>
                  <Text className="text-white text-sm text-white/75 font-poppins">
                    Created Meals will be found here.
                  </Text>
                </View>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => {
            const selected = Boolean(
              selectedMeals.find((meal) => meal.id === item.id),
            );

            const energy = getEnergy(item);
            const portionSize = item.metadata.portionSize;

            return (
              <MealItem
                selected={selected}
                title={item.name}
                onMenu={() => setMenuFocusedItem(item)}
                subtitle={format(
                  "%d%s %d%s",
                  energy.value,
                  energy.unit,
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
            onChange([...values, ...selectedMeals]);
            props.onRequestClose?.();
          }}
          style={{
            opacity: selectedMeals.length > 0 ? 1 : 0,
            marginBottom: bottom,
          }}
        />
      </View>
      {showCreateFoodModal && (
        <CreateFoodModal
          initialValue={selectedMeal}
          visible={showCreateFoodModal}
          onRequestClose={() => {
            setShowCreateFoodModal(false);
            setSelectedMeal(undefined);
          }}
        />
      )}
      {selectedMeal && (
        <MealConfirmDeletion
          meal={selectedMeal}
          visible={showDeleteFoodModal}
          onRequestClose={() => setShowDeleteFoodModal(false)}
        />
      )}
      {menuFocusedItem && (
        <CrudListItemMenu
          onClose={() => setMenuFocusedItem(undefined)}
          onAction={(action) => {
            switch (action) {
              case "edit": {
                setSelectedMeal(menuFocusedItem);
                setShowCreateFoodModal(true);
                break;
              }
              case "delete": {
                setSelectedMeal(menuFocusedItem);
                setShowDeleteFoodModal(true);
                break;
              }
            }

            setMenuFocusedItem(undefined);
          }}
        />
      )}
    </>
  );
}
