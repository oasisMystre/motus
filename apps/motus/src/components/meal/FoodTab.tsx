import clsx from "clsx";
import type z from "zod";
import Color from "color";
import { format } from "util";
import { useTranslation } from "react-i18next";
import { useCallback, useMemo, useState } from "react";
import type { NativeSyntheticEvent } from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BarcodeIcon, ScanIcon } from "phosphor-react-native";
import type { Product } from "@openfoodfacts/openfoodfacts-nodejs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { mealInsertSchema, mealSelectSchema } from "@motus/server";
import { convertProductToMeal, searchFood } from "@motus/openfoodfacts";
import { useCameraPermissions, type PermissionResponse } from "expo-camera";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  FlatList,
} from "react-native";

import { MealItem } from ".";
import Button from "../Button";
import { Colors } from "../../constants";
import { useSearch } from "../SearchInput";
import MealScanModal from "./MealScanModal";
import type KeyboardView from "../KeyboardView";
import { getEnergy } from "../../utils/get-energy";
import { useTRPC } from "../../providers/TRPCProvider";

type AddFoodModalProps = {
  values: z.infer<typeof mealSelectSchema>[];
  onRequestClose?: (ev?: NativeSyntheticEvent<any>) => void;
  onChange: (values: z.infer<typeof mealSelectSchema>[]) => void;
} & React.ComponentProps<typeof KeyboardView>;

export default (function FoodTab({
  onChange,
  values,
  onRequestClose,
  ...props
}: AddFoodModalProps) {
  const trpc = useTRPC();
  const { value } = useSearch();
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedMeals, setSelectedMeals] = useState<Product[]>([]);
  const [showCamera, setShowCamera] = useState<"scan" | "picture" | null>(null);

  const actions = useMemo(
    () =>
      [
        { title: "Scan meal", icon: ScanIcon, type: "picture" },
        { title: "Scan a Barcode", icon: BarcodeIcon, type: "scan" },
      ] as const,
    [],
  );

  const { isPending, mutateAsync } = useMutation(
    trpc.meal.create_atomic.mutationOptions(),
  );

  const { data } = useQuery({
    queryKey: ["meals", value],
    queryFn: () => searchFood(value),
  });

  const addMeals = useCallback(
    async (...meals: Product[]) => {
      const localMeals = meals.map(convertProductToMeal) as unknown as z.infer<
        typeof mealInsertSchema
      >[];
      const onlineMeals = await mutateAsync(localMeals);
      return [...values, ...onlineMeals] as z.infer<typeof mealSelectSchema>[];
    },
    [mutateAsync, values],
  );

  const onShowCamera = useCallback(
    (action: "picture" | "scan", response?: PermissionResponse) => {
      if (permission?.granted || response?.granted) setShowCamera(action);
    },
    [permission],
  );

  return (
    <>
      <View
        className={clsx("flex-1 mt-4", props.className)}
        {...props}
      >
        <FlatList
          data={data?.products}
          contentContainerStyle={{ flexGrow: 1 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={() => (
            <ActivityIndicator
              color="white"
              style={{ margin: "auto" }}
            />
          )}
          ListHeaderComponent={() => (
            <View className="gap-y-8 mb-2">
              <View
                className="flex-row gap-x-4 px-4 py-4"
                style={{
                  backgroundColor: Color(Colors.primary).alpha(0.1).hexa(),
                }}
              >
                {actions.map((action, index) => (
                  <Pressable
                    key={index}
                    className="flex-1 gap-y-2 p-4 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: Color("white").alpha(0.05).hexa(),
                    }}
                    onPress={() => {
                      if (permission?.granted)
                        return setShowCamera(action.type);

                      return requestPermission().then((response) =>
                        onShowCamera(action.type, response),
                      );
                    }}
                  >
                    <View className="size-12 bg-primary rounded-full">
                      <action.icon
                        color="white"
                        style={{ margin: "auto" }}
                      />
                    </View>
                    <Text className="text-white font-poppins">
                      {action.title}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={{ paddingHorizontal: 16 }}>
                <Text
                  className="text-lg font-poppins-medium"
                  style={{ color: Colors.grey }}
                >
                  Suggestions
                </Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => {
            const selected = Boolean(
              selectedMeals.find((meal) => meal.id === item.id),
            );

            const energy = getEnergy(item);
            const portionSize = {
              value: item.serving_quantity,
              unit: item.serving_quantity_unit,
            };

            return (
              <>
                {item.product_name && (
                  <MealItem
                    hideActions
                    title={item.product_name}
                    subtitle={format(
                      "%d%s %d%s",
                      energy.value,
                      energy.unit,
                      portionSize.value ?? 0,
                      portionSize.unit ?? "ml",
                    )}
                    selected={selected}
                    onPress={() => {
                      if (selected)
                        setSelectedMeals((meals) =>
                          meals.filter((meal) => meal.id !== item.id),
                        );
                      else setSelectedMeals((meals) => meals.concat([item]));
                    }}
                  />
                )}
              </>
            );
          }}
        />
        <View className="px-4">
          {selectedMeals.length > 0 && (
            <Button
              disabled={isPending}
              submitting={isPending}
              text={t("log.log_meal.add_food_action", {
                count: selectedMeals.length,
              })}
              onPress={(event) =>
                addMeals(...selectedMeals).then((meals) => {
                  onChange(meals);
                  onRequestClose?.(event);
                })
              }
              style={{ backgroundColor: Colors.primary, marginBottom: bottom }}
            />
          )}
        </View>
      </View>
      {showCamera && (
        <MealScanModal
          type={showCamera}
          visible={Boolean(showCamera)}
          onRequestClose={() => setShowCamera(null)}
          onChange={(event, meals) => {
            onChange(meals);
            onRequestClose?.(event);
          }}
        />
      )}
    </>
  );
});
