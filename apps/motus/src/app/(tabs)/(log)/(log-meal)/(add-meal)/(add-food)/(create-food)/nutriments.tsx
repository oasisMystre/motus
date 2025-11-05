import { format } from "util";
import { useMemo } from "react";
import { useFormikContext } from "formik";

import { Text, TextInput, View, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../../../../../../../constants";
import Button from "../../../../../../../components/Button";
import { nutriments } from "../../../../../../../constants/nutriments";
import KeyboardView from "../../../../../../../components/KeyboardView";

export default function NutrimentScreen() {
  const { bottom } = useSafeAreaInsets();
  const { values, errors, isValid, isSubmitting, setFieldValue, handleSubmit } =
    useFormikContext<{
      metadata: {
        nutriments: { [key: string]: { value: number; unit: string } };
      };
    }>();

  const disabled = useMemo(
    () => !isValid || isSubmitting,
    [isValid, isSubmitting],
  );

  return (
    <KeyboardView style={{ marginBottom: bottom }}>
      <View className="flex-1">
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
                  placeholderTextColor={Colors.grey}
                  cursorColor={Colors.primary}
                  selectionColor={Colors.primary}
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
        <Button
          text="Save"
          disabled={disabled}
          submitting={isSubmitting}
          onPress={() => handleSubmit()}
          style={{ backgroundColor: isValid ? Colors.primary : Colors.grey }}
        />
      </View>
    </KeyboardView>
  );
}
