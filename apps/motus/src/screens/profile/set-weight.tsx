import type z from "zod";
import { useMemo } from "react";
import { useFormikContext } from "formik";
import capitalize from "lodash.capitalize";
import { useTranslation } from "react-i18next";
import type { userSelectSchema } from "@motus/server";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { Colors } from "../../constants";
import Input from "../../components/Input";
import useDimensions from "../../hooks/useDimensions";
import { CircularBackButton } from "../../components/Header";
import DropdownPicker from "../../components/forms/DropdownPicker";

type SetWeightScreenProps = {
  goBack: () => void;
  next: () => void;
};

export function SetWeightScreen({ goBack, next }: SetWeightScreenProps) {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const { width } = useDimensions("window");

  const { values, handleChange, handleBlur, setFieldValue } =
    useFormikContext<Partial<z.infer<typeof userSelectSchema>>>();

  const isValid = useMemo(
    () => values.profile?.height?.unit && values.profile.height.value,
    [values],
  );

  return (
    <KeyboardAwareScrollView
      contentContainerClassName="flex-1 px-6"
      style={{ width, marginBottom: bottom }}
    >
      <View className="flex-1 gap-y-8 pt-8">
        <View>
          <Text className="text-xl text-white font-poppins-semibold">
            {t("auth.profile.more.title")}
          </Text>
        </View>
        <View className="flex-1">
          <Input
            label="How much do you weight?"
            className="flex-1"
            labelAttrs={{
              style: {
                color: Colors.grey,
              },
            }}
            inputAttrs={{
              placeholder: "5.1",
              keyboardType: "numeric",
              className: "py-4 px-2 rounded-md",
              value: values.profile?.weight?.value,
              onBlur: handleBlur("profile.weight.value"),
              onChangeText(text) {
                setFieldValue("profile.weight.value", parseFloat(text));
              },
              focusStyle: { borderColor: Colors.primary },
              style: { borderWidth: 1, borderColor: Colors.grey },
            }}
          />
          <DropdownPicker
            value={values.profile?.weight?.unit}
            data={["kg", "ibs"].map((value) => ({
              label: ["ibs"].includes(value) ? capitalize(value) : value,
              value,
            }))}
            itemTextStyle={{ color: "white" }}
            onValueChanged={({ item: { value } }) =>
              handleChange("profile.weight.unit")(value)
            }
          />
        </View>
      </View>
      <View className="flex-row items-center gap-x-8">
        <CircularBackButton
          canGoBack
          navigation={{ goBack }}
        />
        <Pressable
          disabled={!isValid}
          onPress={next}
          className="flex-1 items-center justify-center p-4 rounded-md"
          style={{
            backgroundColor: isValid ? Colors.primary : Colors.grey,
          }}
        >
          <Text className="text-white font-poppins">
            {t("auth.next_action")}
          </Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}
