import type z from "zod";
import { useFormik } from "formik";
import { number, object } from "yup";
import type React from "react";
import { useMemo } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import type { mealSelectSchema } from "@motus/server";
import { Text, TextInput, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { MealInfo } from "./MealInfo";
import { Colors } from "../../constants";
import { getMealInfo } from "../../utils/get-meal-info";

type EditMealEntryProps = {
  meal: z.infer<typeof mealSelectSchema>;
  onChange: (
    value: z.infer<typeof mealSelectSchema>["metadata"]["portion"],
  ) => void;
} & Omit<React.ComponentProps<typeof BottomSheet>, "children">;

export default function EditMealEntry({
  meal,
  onClose,
  onChange,
  ...props
}: EditMealEntryProps) {
  const { bottom, top } = useSafeAreaInsets();
  const info = useMemo(() => getMealInfo(meal), [meal]);

  const { isValid, values, handleSubmit, handleChange } = useFormik({
    initialValues: meal.metadata.portion,
    validationSchema: object({
      size: object({
        value: number(),
      }),
      count: number(),
    }),

    onSubmit(value) {
      onChange(value);
      onClose?.();
    },
  });

  return (
    <BottomSheet
      {...props}
      backgroundStyle={{ backgroundColor: Colors.background[3] }}
      handleIndicatorStyle={{ backgroundColor: Colors.grey, width: 64 }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          onPress={() => onClose?.()}
        />
      )}
      handleComponent={() => (
        <View
          className="flex-row items-center"
          style={{ borderBottomWidth: 1, borderBottomColor: Colors.darkGray }}
        >
          <Pressable
            className="p-4"
            onPress={onClose}
          >
            <MaterialIcons
              name="close"
              size={24}
              color="white"
            />
          </Pressable>
          <Text className="flex-1 text-lg text-center text-white font-poppins-medium">
            {meal.name}
          </Text>
          {isValid && (
            <Pressable
              className="ml-auto p-4"
              onPress={() => handleSubmit()}
            >
              <MaterialIcons
                name="check"
                size={24}
                color="white"
              />
            </Pressable>
          )}
        </View>
      )}
    >
      <BottomSheetView>
        <KeyboardAvoidingView
          style={{
            flex: 1,
            rowGap: 16,
            paddingTop: 16,
            paddingBottom: bottom,
            paddingHorizontal: 16,
          }}
        >
          <View className="flex flex-col gap-y-4">
            <View className="flex flex-col gap-y-2">
              <View className="flex flex-row items-center justify-between">
                <Text
                  className="font-poppins"
                  style={{ color: "white" }}
                >
                  Serving Size
                </Text>
                <View className="flex flex-row items-center border border-stone-500 px-2 rounded-md min-w-24">
                  <TextInput
                    className="flex-1 py-2 text-right"
                    keyboardType="numeric"
                    style={{ color: "white" }}
                    value={values.size.value.toString()}
                    onChangeText={handleChange("size.value")}
                  />
                  <Text
                    className="text-sm font-poppins"
                    style={{ color: "white" }}
                  >
                    &nbsp;
                    {meal.metadata.portion.size.unit}
                  </Text>
                </View>
              </View>
              <View className="flex flex-row items-center justify-between">
                <Text
                  className="font-poppins"
                  style={{ color: "white" }}
                >
                  Number of Serving
                </Text>
                <TextInput
                  className="border border-stone-500 p-2 text-white text-end rounded-md min-w-16"
                  placeholder="1"
                  keyboardType="numeric"
                  value={values.count.toString()}
                  onChangeText={handleChange("count")}
                />
              </View>
              <MealInfo info={info} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheet>
  );
}
