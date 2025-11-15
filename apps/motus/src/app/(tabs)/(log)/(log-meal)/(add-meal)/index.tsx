import type z from "zod";
import { useEffect, useMemo, useState } from "react";
import { useFormikContext } from "formik";
import type { mealSelectSchema } from "@motus/server";
import { CoffeeIcon } from "phosphor-react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

import { Colors } from "../../../../../constants";
import Input from "../../../../../components/Input";
import Button from "../../../../../components/Button";
import RadioInput from "../../../../../components/RadioInput";
import KeyboardView from "../../../../../components/KeyboardView";
import { MealHeader, MealInfo, MealList } from "../../../../../components/meal";

export default function AddMealScreen() {
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets();
  const { action } = useLocalSearchParams<{ action?: "edit" | "duplicate" }>();
  const [file, setFile] = useState<string>();
  const { showPortionSize } = useLocalSearchParams();

  const screenTitle = useMemo(
    () => (action === "edit" ? "Edit Meal Log" : "Meal Log"),
    [action],
  );

  const mealCategories = useMemo(
    () => [
      {
        name: "Breakfast",
        icon: (
          <CoffeeIcon
            size={18}
            color={Colors.primary}
          />
        ),
      },
      {
        name: "Lunch",
        icon: (
          <MaterialIcons
            size={18}
            name="lunch-dining"
            color="#FE761B"
          />
        ),
      },
      {
        name: "Dinner",
        icon: (
          <MaterialCommunityIcons
            size={18}
            name="food-turkey"
            color="#A96027"
          />
        ),
      },
      {
        name: "Snack",
        icon: (
          <MaterialCommunityIcons
            size={18}
            name="cupcake"
            color="#D0592A"
          />
        ),
      },
    ],
    [],
  );

  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useFormikContext<{
    name: string;
    category: string;
    image: string | undefined;
    meals: z.infer<typeof mealSelectSchema>[];
    metadata: {};
  }>();

  const disabled = useMemo(
    () => !isValid || isSubmitting,
    [isValid, isSubmitting],
  );

  const info = useMemo(() => {
    const getValue = (key: string) =>
      values.meals.reduce(
        (acc, meal) => {
          const value = meal.metadata.nutriments[key];
          if (value)
            return {
              unit: meal.metadata.nutriments[key].unit,
              value: acc.value + meal.metadata.nutriments[key].value,
            };
          return acc;
        },
        { unit: "g", value: 0 },
      );

    const fats = getValue("fats");
    const proteins = getValue("proteins");
    const energy = getValue("energy-kcal");
    const carbohydrates = getValue("carbohydrates");

    const info = { proteins, fats, carbohydrates, energy };

    return info;
  }, [values.meals]);

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <MealHeader
          title={screenTitle}
          navigation={navigation}
          onImage={(file) => setFile(file.uri)}
        />
      ),
    });
    return () => navigation.setOptions({ header: false });
  }, [navigation]);

  useEffect(() => {
    setFieldValue("metadata", info);
  }, [info]);

  return (
    <KeyboardView style={{ marginBottom: bottom, zIndex: 0 }}>
      <View className="flex-1">
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 gap-y-8 p-2">
            <Input
              label="Meal Name"
              error={touched.name && errors.name}
              inputAttrs={{
                value: values.name,
                placeholder: "e.g Chicken soup",
                style: {
                  borderWidth: 1,
                  paddingHorizontal: 8,
                  paddingVertical: 16,
                  borderRadius: 8,
                },
                onBlur: handleBlur("name"),
                onChangeText: handleChange("name"),
              }}
            />
            {showPortionSize && (
              <Input
                label="Portion Size"
                error={touched.name && errors.name}
                inputAttrs={{
                  value: values.name,
                  inputMode: "numeric",
                  keyboardType: "decimal-pad",
                  placeholder: "Portion Size",
                  style: {
                    borderWidth: 1,
                    paddingHorizontal: 8,
                    paddingVertical: 16,
                    borderRadius: 8,
                  },
                  onBlur: handleBlur("metadata.meals.0.portionSize.value"),
                  onChangeText: handleChange(
                    "metadata.meals.0.portionSize.value",
                  ),
                }}
              />
            )}
            {values.meals.length > 0 && (
              <MealInfo
                info={info}
                energy={info.energy}
              />
            )}
            <View>
              <Text
                className="text-lg font-poppins"
                style={{ color: Colors.grey }}
              >
                Meal Category
              </Text>
              <View>
                {mealCategories.map((meal, index) => {
                  const selected =
                    values.category.toLowerCase() === meal.name.toLowerCase();

                  return (
                    <Pressable
                      key={index}
                      className="flex-row gap-x-2 items-center py-2"
                      onBlur={handleBlur("category")}
                      onPress={() =>
                        setFieldValue("category", meal.name.toLowerCase())
                      }
                    >
                      <RadioInput
                        disabled
                        value={selected}
                        style={{ width: 16, height: 16 }}
                      />
                      {meal.icon}
                      <Text className="text-white font-poppins">
                        {meal.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {touched.category && errors.category && (
                <Text className="text-sm text-red-500 font-poppins">
                  {errors.category}
                </Text>
              )}
            </View>
            <MealList meals={values.meals} />
          </View>
        </ScrollView>
        <View className=" gap-y-4">
          <Button
            text="Add Food"
            style={{
              backgroundColor: "none",
              borderWidth: 1,
              borderColor: Colors.grey,
            }}
            onPress={() => router.push("/(add-food)")}
          />
          <Button
            text="Save meal"
            disabled={disabled}
            submitting={isSubmitting}
            onPress={() => handleSubmit()}
          />
        </View>
      </View>
    </KeyboardView>
  );
}
