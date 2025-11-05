import type z from "zod";
import { useMemo } from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import type { userSelectSchema } from "@motus/server";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../../constants";
import Input from "../../components/Input";
import useDimensions from "../../hooks/useDimensions";
import { CircularBackButton } from "../../components/Header";

type SetAgeScreenProps = {
  goBack: () => void;
  next: () => void;
};

export function SetAgeScreen({ goBack, next }: SetAgeScreenProps) {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const { width } = useDimensions("window");

  const { values, handleBlur, setFieldValue } =
    useFormikContext<Partial<z.infer<typeof userSelectSchema>>>();

  const isValid = useMemo(() => values.profile?.age, [values]);

  return (
    <View
      className="flex-1 px-6"
      style={{ width, marginBottom: bottom }}
    >
      <ScrollView
        contentContainerClassName="flex-1 gap-y-8 pt-8"
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text className="text-xl text-white font-poppins-semibold">
            {t("auth.profile.set_age.title")}
          </Text>
        </View>
        <View>
          <Input
            label={t("auth.profile.set_age.input_label")}
            labelAttrs={{
              style: {
                color: Colors.grey,
              },
            }}
            inputAttrs={{
              placeholder: "18",
              keyboardType: "numeric",
              value: values.profile?.age!,
              onBlur: handleBlur("profile.age"),
              onChangeText(text) {
                setFieldValue("profile.age", parseFloat(text));
              },
              className: "py-4 px-2 rounded-md",
              focusStyle: { borderColor: Colors.primary },
              style: { borderWidth: 1, borderColor: Colors.grey },
            }}
          />
        </View>
      </ScrollView>
      <View className="flex-row items-center gap-x-8">
        <CircularBackButton
          canGoBack
          navigation={{ goBack }}
        />
        <Pressable
          onPress={next}
          disabled={!isValid}
          className="flex-1 items-center justify-center p-4 rounded-md"
          style={{ backgroundColor: isValid ? Colors.primary : Colors.grey }}
        >
          <Text className="text-white font-poppins">
            {t("auth.next_action")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
