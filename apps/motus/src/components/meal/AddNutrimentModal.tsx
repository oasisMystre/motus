import type z from "zod";
import { format } from "util";
import { useFormik } from "formik";
import { useCallback } from "react";
import { number, object, string } from "yup";
import type { mealSelectSchema } from "@motus/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  KeyboardAvoidingView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import {
  Text,
  View,
  Modal,
  FlatList,
  TextInput,
  type NativeSyntheticEvent,
} from "react-native";

import Button from "../Button";
import { BackButton } from "../Header";
import { Colors } from "../../constants";
import { useTRPC } from "../../providers/TRPCProvider";
import { nutriments } from "../../constants/nutriments";
import { useTanstackStore } from "../../hooks/useTanstackStore";

type AddNutrimentModalProps = {
  values:
    | {
        name: string;
        brandName?: string;
        metadata: {
          portionSize: {
            value: number;
            unit: "bag" | "cup" | "g" | "kg" | "litre" | "sachet";
          };
          nutriments: {
            [key: string]: {
              value: number;
              unit: "%" | "cal" | "g" | "kcal" | "mg";
            };
          };
        };
      }
    | z.infer<typeof mealSelectSchema>;
  onCreate: (value: z.infer<typeof mealSelectSchema>) => void;
  onRequestClose?: (ev?: NativeSyntheticEvent<any>) => void;
} & React.ComponentProps<typeof Modal>;

export default function AddNutrimentModal({
  values: initialValues,
  onCreate,
  ...props
}: AddNutrimentModalProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { bottom, top } = useSafeAreaInsets();
  const { mutateAsync } = useMutation(trpc.meal.create.mutationOptions());
  const { mutateAsync: editMealAsync } = useMutation(
    trpc.meal.update.mutationOptions(),
  );

  const { update } = useTanstackStore(
    queryClient,
    trpc.meal.list.queryKey({ search: undefined }),
    (meal) => meal.id,
  );
  const {
    errors,
    values,
    isValid,
    isSubmitting,
    setFieldValue,
    handleSubmit,
    resetForm,
  } = useFormik({
    initialValues,
    validateOnMount: true,
    validationSchema: object({
      metadata: object({
        nutriments: object(
          Object.fromEntries(
            nutriments.map((nutriment) => {
              let value = number();
              if (nutriment.required) value = value.required();
              return [
                nutriment.key,
                object({ value, unit: string().oneOf([nutriment.unit]) }),
              ];
            }),
          ),
        ),
      }),
    }),
    async onSubmit(values, { resetForm }) {
      let data;
      if ("id" in values) data = await editMealAsync(values);
      else data = await mutateAsync(values);

      update(data);
      onCreate(data);
      return resetForm();
    },
  });

  const onClose = useCallback(
    (event?: NativeSyntheticEvent<any>) => {
      resetForm();
      props.onRequestClose?.(event);
    },
    [props.onRequestClose],
  );

  return (
    <Modal
      {...props}
      animationType="slide"
      backdropColor={Colors.backgroundColor}
    >
      <KeyboardAvoidingView
        style={{
          flex: 1,
          rowGap: 16,
          paddingTop: top,
          paddingBottom: bottom,
          paddingHorizontal: 16,
          backgroundColor: Colors.backgroundColor,
        }}
      >
        <View className="flex flex-row">
          <BackButton
            canGoBack
            navigation={{
              goBack: (event) => onClose(event),
            }}
          />
          <Text className="flex-1 text-lg text-white text-center font-poppins-medium">
            Add Nutriments
          </Text>
        </View>
        <FlatList
          data={nutriments}
          style={{ flex: 1, paddingTop: 16 }}
          ListHeaderComponent={() => (
            <Text
              className="font-poppins-medium"
              style={{ color: Colors.grey }}
            >
              Nutrition Facts
            </Text>
          )}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: Colors.darkGray }} />
          )}
          renderItem={({ item }) => {
            const value = values.metadata.nutriments[item.key];

            return (
              <View className="flex-row items-center  py-2">
                <Text className="flex-1 text-white font-poppins">
                  {item.name} ({item.unit})
                </Text>
                <TextInput
                  inputMode="numeric"
                  keyboardType="number-pad"
                  value={value.value?.toString()}
                  cursorColor={Colors.primary}
                  selectionColor={Colors.primary}
                  placeholderTextColor={Colors.grey}
                  selectionHandleColor={Colors.primary}
                  className="flex-1 text-right py-2 font-poppins text-white"
                  placeholder={item.required ? "Required" : "Optional"}
                  onChangeText={(value) => {
                    const fieldName = format(
                      "metadata.nutriments.%s",
                      item.key,
                    );
                    setFieldValue(fieldName, { value, unit: item.unit });
                  }}
                />
              </View>
            );
          }}
        />
        <KeyboardStickyView>
          <Button
            text="Save"
            disabled={!isValid}
            submitting={isSubmitting}
            onPress={() => handleSubmit()}
            style={{
              backgroundColor: isValid ? Colors.primary : Colors.grey,
            }}
          />
        </KeyboardStickyView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
