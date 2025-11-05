import type z from "zod";
import { useMemo } from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import type { userSelectSchema } from "@motus/server";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../../constants";
import Input from "../../components/Input";
import useDimensions from "../../hooks/useDimensions";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type SetNameScreenProps = {
  goBack: () => void;
  next: () => void;
};

export function SetNameScreen({ next }: SetNameScreenProps) {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const { width } = useDimensions("window");

  const { values, handleChange, handleBlur } =
    useFormikContext<Partial<z.infer<typeof userSelectSchema>>>();
  const isValid = useMemo(() => values.name, [values]);

  return (
    <KeyboardAwareScrollView
      contentContainerClassName="flex-1 px-6"
      style={{ width, marginBottom: bottom }}
    >
      <View className="flex-1 gap-y-8 pt-8">
        <View>
          <Text className="text-xl text-white font-poppins-semibold">
            {t("auth.profile.set_name.title")}
          </Text>
          <Text
            className="font-poppins"
            style={{
              color: Colors.grey,
            }}
          >
            {t("auth.profile.set_name.subtitle")}
          </Text>
        </View>
        <View>
          <Input
            label={t("auth.profile.set_name.input_label")}
            labelAttrs={{
              style: {
                color: Colors.grey,
              },
            }}
            inputAttrs={{
              value: values.name,
              autoCorrect: false,
              autoComplete: "name-given",
              placeholder: "John Doe",
              onBlur: handleBlur("name"),
              onChangeText: handleChange("name"),
              className: "py-4 px-2 rounded-md",
              focusStyle: { borderColor: Colors.primary },
              style: { borderWidth: 1, borderColor: Colors.grey },
            }}
          />
        </View>
      </View>
      <View>
        <Pressable
          disabled={!isValid}
          onPress={next}
          className="items-center justify-center p-4 rounded-md"
          style={{ backgroundColor: isValid ? Colors.primary : Colors.grey }}
        >
          <Text className="text-white font-poppins">
            {t("auth.next_action")}
          </Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}
