import { router } from "expo-router";
import { useFormikContext } from "formik";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Button from "../../../../../../../components/Button";
import Input from "../../../../../../../components/Input";
import KeyboardView from "../../../../../../../components/KeyboardView";
import DropdownPicker from "../../../../../../../components/forms/DropdownPicker";

const PortionSizeUnits = ["kg", "g", "cup", "litre"];

export default function CreateFoodScreen() {
  const { bottom } = useSafeAreaInsets();

  const { values, errors, touched, setFieldValue, handleChange, handleBlur } =
    useFormikContext<{
      brandName: string;
      name: string;
      metadata: { portionSize: { value: number; unit: string } };
    }>();

  const disabled = useMemo(
    () =>
      Boolean(
        errors.brandName ||
          errors.metadata?.portionSize?.value ||
          errors.metadata?.portionSize?.unit ||
          errors.name,
      ),
    [errors.brandName, errors.metadata?.portionSize, errors.name],
  );

  return (
    <KeyboardView style={{ marginTop: 16, marginBottom: bottom }}>
      <View className="flex-1 gap-y-8">
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
                touched.metadata?.portionSize?.value &&
                errors.metadata?.portionSize?.value
              }
              inputAttrs={{
                style: style.input,
                placeholder: "1 Cup",
                value: values.metadata.portionSize.value,
                onBlur: handleBlur("metadata.portionSize.value"),
                onChangeText(value) {
                  const data = parseFloat(value);
                  if (!Number.isNaN(data))
                    setFieldValue("metadata.portionSize.value", data);
                },
              }}
            />
          </View>
        </View>
        <DropdownPicker
          itemTextStyle={{ color: "white" }}
          data={PortionSizeUnits.map((size) => ({
            value: size,
            lable: size,
          }))}
          value={values.metadata.portionSize.unit}
          onValueChanged={({ item }) =>
            setFieldValue("metadata.portionSize.unit", item.value)
          }
        />
        <Button
          text="Next"
          disabled={disabled}
          onPress={() => router.push("/nutriments")}
        />
      </View>
    </KeyboardView>
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
