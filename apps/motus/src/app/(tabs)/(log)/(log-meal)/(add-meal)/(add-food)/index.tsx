import type z from "zod";
import Color from "color";
import { format } from "util";
import { useState } from "react";
import { router } from "expo-router";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";

import type { mealSelectSchema } from "@motus/server";
import type { Product } from "@openfoodfacts/openfoodfacts-nodejs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BarcodeIcon, ScanIcon } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { convertProductToMeal, searchFood } from "@motus/openfoodfacts";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  FlatList,
} from "react-native";

import { Colors } from "../../../../../../constants";
import { openFoodFact } from "../../../../../../utils";
import Button from "../../../../../../components/Button";
import { useSnackbar } from "../../../../../../providers";
import { MealItem } from "../../../../../../components/meal";
import { useTRPC } from "../../../../../../providers/TRPCProvider";
import KeyboardView from "../../../../../../components/KeyboardView";
import { useSearch } from "../../../../../../components/SearchInput";
import CameraModal from "../../../../../../components/modals/CameraModal";

const actions = [
  { title: "Scan meal", icon: ScanIcon, type: "picture" },
  { title: "Scan a Barcode", icon: BarcodeIcon, type: "scan" },
] as const;

export default function AddFoodScreen() {
  const trpc = useTRPC();
  const { value } = useSearch();
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const { bottom } = useSafeAreaInsets();
  const [selectedMeals, setSelectedMeals] = useState<Product[]>([]);
  const [showCamera, setShowCamera] = useState<"scan" | "picture" | null>(null);
  const { values, setFieldValue } = useFormikContext<{
    meals: z.infer<typeof mealSelectSchema>[];
  }>();

  const { isPending, mutateAsync } = useMutation(
    trpc.meal.create_atomic.mutationOptions(),
  );

  const { data } = useQuery({
    queryKey: ["meals", value],
    queryFn: () => searchFood(value),
  });

  const addMeals = async (meals: Product[]) => {
    const localMeals = meals.map(convertProductToMeal);
    const onlineMeals = await mutateAsync(localMeals);
    const data = [...values.meals, ...onlineMeals];
    setFieldValue("meals", data);
    return router.dismissAll();
  };

  return (
    <>
      <KeyboardView
        className="px-0 mt-4"
        style={{ marginBottom: bottom }}
      >
        <View className="flex-1">
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
                  className="flex-row gap-x-4 px-6 py-4"
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
                <View className="px-6">
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
                      title={item.product_name}
                      subtitle={format(
                        "%d%s %d%s",
                        energy,
                        energyUnit,
                        portionSize.value,
                        portionSize.unit,
                      )}
                      selected={selected}
                      style={{ marginHorizontal: 24 }}
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
          <View className="px-6">
            {selectedMeals.length > 0 && (
              <Button
                disabled={isPending}
                submitting={isPending}
                text={t("log.log_meal.add_food_action", {
                  count: selectedMeals.length,
                })}
                onPress={() => addMeals(selectedMeals)}
                style={{ backgroundColor: Colors.primary }}
              />
            )}
          </View>
        </View>
      </KeyboardView>
      {showCamera && (
        <CameraModal
          onRequestClose={() => setShowCamera(null)}
          onScanned={async (result) => {
            const barcode = result.data;
            const product = await openFoodFact.getProductV3(barcode, {
              fields: [
                "id",
                "abbreviated_product_name",
                "nutrition",
                "product_name",
                "product_name_en",
                "product_quantity",
                "product_quantity_unit",
                "serving_quantity",
                "serving_quantity_unit",
              ],
            });

            if (product.data && product.data.result) {
              snackbar.success({ text: "Product Found" });

              const data = product.data.result as unknown as Product;
              return addMeals([data]);
            } else snackbar.error({ text: "No product found" });
          }}
        />
      )}
    </>
  );
}
