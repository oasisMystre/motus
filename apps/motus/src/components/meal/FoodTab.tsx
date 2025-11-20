import clsx from "clsx";
import type z from "zod";
import Color from "color";
import { format } from "util";
import { useTranslation } from "react-i18next";
import type { NativeSyntheticEvent } from "react-native";
import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BarcodeIcon, ScanIcon } from "phosphor-react-native";
import type { Product } from "@openfoodfacts/openfoodfacts-nodejs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { mealInsertSchema, mealSelectSchema } from "@motus/server";
import { convertProductToMeal, searchFood } from "@motus/openfoodfacts";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  FlatList,
} from "react-native";

import Button from "../Button";
import { MealItem } from ".";
import { Colors } from "../../constants";
import { openFoodFact } from "../../utils";
import type KeyboardView from "../KeyboardView";
import { useSearch } from "../SearchInput";
import CameraModal from "../modals/CameraModal";
import { useTRPC } from "../../providers/TRPCProvider";
import { useSnackbar, useLoading } from "../../providers";
import { withLoading } from "../../providers/LoadingProvider";

type AddFoodModalProps = {
  values: z.infer<typeof mealSelectSchema>[];
  onRequestClose?: (ev?: NativeSyntheticEvent<any>) => void;
  onChange: (values: z.infer<typeof mealSelectSchema>[]) => void;
} & React.ComponentProps<typeof KeyboardView>;

export default withLoading(function FoodTab({
  onChange,
  values,
  onRequestClose,
  ...props
}: AddFoodModalProps) {
  const trpc = useTRPC();
  const { value } = useSearch();
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const loading = useLoading();
  const { bottom } = useSafeAreaInsets();
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

  const { mutateAsync: fetchProductFn, ...fetchProductArgs } = useMutation({
    mutationFn: async (barcode: string) => {
      const response = await openFoodFact.getProductV2(barcode);
      const result = response.data?.product as unknown as Product | undefined;

      if (result) return addMeals(result);
      return null;
    },
    onSuccess(product) {
      if (product)
        return snackbar.success({ text: "Product found and added to meals." });
      else return snackbar.error({ text: "No product found" });
    },
  });

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
    [mutateAsync],
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
                    onPress={() => setShowCamera(action.type)}
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

            const energy = item.nutriments?.["energy-kcal"];
            const energyUnit = item.nutriments?.energy_unit;
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
                      energy,
                      energyUnit,
                      portionSize.value,
                      portionSize.unit,
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
        <CameraModal
          onRequestClose={() => setShowCamera(null)}
          onScanned={async (result) => {
            const barcode = result.data;
            setShowCamera(null);
            if (!fetchProductArgs.isPending) {
              await loading.promise(fetchProductFn(barcode), {
                title: "Fetching product",
                subtitle: "This might take a moment...",
              });
              onRequestClose?.();
            }
          }}
        />
      )}
    </>
  );
});
