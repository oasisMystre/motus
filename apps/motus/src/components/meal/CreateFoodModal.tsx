import type z from "zod";
import { useFormik } from "formik";
import { useCallback, useState } from "react";
import { number, object, string } from "yup";
import type { mealSelectSchema } from "@motus/server";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
  StyleSheet,
  View,
  Modal,
  Text,
  type NativeSyntheticEvent,
} from "react-native";

import Input from "../Input";
import Button from "../Button";
import { BackButton } from "../Header";
import { Colors } from "../../constants";
import AddNutrimentModal from "./AddNutrimentModal";
import DropdownPicker from "../forms/DropdownPicker";

const PortionSizeUnits = ["kg", "g", "cup", "litre", "satchet"];

type CreateFoodModalProps = {
  initialValue?: z.infer<typeof mealSelectSchema>;
  onRequestClose?: (ev?: NativeSyntheticEvent<any>) => void;
  onChange?: (value: z.infer<typeof mealSelectSchema>) => void;
} & React.ComponentProps<typeof Modal>;

export default function CreateFoodModal({
  onChange,
  initialValue,
  ...props
}: CreateFoodModalProps) {
  const { bottom, top } = useSafeAreaInsets();
  const [showNutrimentModal, setShowNutrimentModal] = useState(false);

  const formikContext = useFormik({
    validateOnMount: true,
    initialValues: initialValue ?? {
      name: undefined as unknown as string,
      brandName: undefined,
      metadata: {
        portion: {
          count: 1,
          size: {
            unit: "cup" as const,
            value: undefined as unknown as number,
          },
        },
        nutriments: {},
      },
    },
    validationSchema: object({
      name: string().label("Food name").trim().min(1).required(),
      brandName: string().trim().min(1).optional(),
      metadata: object({
        portion: object({
          count: number(),
          size: object({
            value: number().label("Portion size").required(),
            unit: string().oneOf(["g", "kg", "litre", "cup", "satchet"]),
          }),
        }),
      }),
    }),
    async onSubmit() {
      setShowNutrimentModal(true);
    },
  });

  const {
    values,
    errors,
    touched,
    resetForm,
    isValid,
    handleBlur,
    handleSubmit,
    handleChange,
    setFieldValue,
  } = formikContext;

  const onClose = useCallback(
    (event?: NativeSyntheticEvent<any>) => {
      resetForm();
      props.onRequestClose?.(event);
    },
    [props.onRequestClose, resetForm],
  );

  return (
    <Modal
      {...props}
      animationType="slide"
      backdropColor={Colors.backgroundColor}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={{
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
            {initialValue ? "Edit Food" : "Create Food"}
          </Text>
        </View>
        <View className="flex-1">
          <View className="flex-1 gap-y-4">
            <Input
              label="Brand name"
              error={touched.brandName && errors.brandName}
              inputAttrs={{
                value: values.brandName,
                style: style.input,
                placeholder: "Keloggs",
                onBlur: handleBlur("brandName"),
                onChangeText: handleChange("brandName"),
              }}
            />
            <Input
              label="Food name"
              error={touched.name && errors.name}
              inputAttrs={{
                value: values.name,
                style: style.input,
                placeholder: "Cooked Rice",
                onBlur: handleBlur("name"),
                onChangeText: handleChange("name"),
              }}
            />
            <View>
              <Input
                label="Portion Size"
                error={
                  touched.metadata?.portion?.size?.value &&
                  errors.metadata?.portion?.size?.value
                }
                inputAttrs={{
                  style: style.input,
                  placeholder: "1 Cup",
                  value: values.metadata.portion.size.value,
                  onBlur: handleBlur("metadata.portion.size.value"),
                  onChangeText(value) {
                    const data = parseFloat(value);
                    if (!Number.isNaN(data))
                      setFieldValue("metadata.portion.size.value", data);
                  },
                }}
              />
            </View>
            <DropdownPicker
              itemTextStyle={{ color: "white" }}
              data={PortionSizeUnits.map((size) => ({
                value: size,
                lable: size,
              }))}
              value={values.metadata.portion.size.unit}
              onValueChanged={({ item }) =>
                setFieldValue("metadata.portion.size.unit", item.value)
              }
            />
          </View>
          <Button
            text="Next"
            disabled={!isValid}
            onPress={() => handleSubmit()}
          />
        </View>
      </KeyboardAwareScrollView>
      {showNutrimentModal && (
        <AddNutrimentModal
          values={values}
          visible={showNutrimentModal}
          onRequestClose={() => setShowNutrimentModal(false)}
          onCreate={(value) => {
            onChange?.(value);
            onClose();
          }}
        />
      )}
    </Modal>
  );
}

const style = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
});
