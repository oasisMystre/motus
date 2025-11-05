import type z from "zod";
import { useMemo } from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import type { userSelectSchema } from "@motus/server";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Colors } from "../../constants";
import useDimensions from "../../hooks/useDimensions";
import { CircularBackButton } from "../../components/Header";
import GenderPicker from "../../components/forms/GenderPicker";

type SetGendercreenProps = {
  goBack: () => void;
  next: () => void;
};

export function SetGenderScreen({ goBack, next }: SetGendercreenProps) {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const { width } = useDimensions("window");

  const { values, handleChange, handleBlur } =
    useFormikContext<Partial<z.infer<typeof userSelectSchema>>>();

  const isValid = useMemo(() => values.profile?.gender, [values]);

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
            {t("auth.profile.set_gender.title")}
          </Text>
          <Text
            className="font-poppins"
            style={{
              color: Colors.grey,
            }}
          >
            {t("auth.profile.set_gender.subtitle")}
          </Text>
        </View>
        <GenderPicker
          value={values.profile?.gender}
          onBlur={handleBlur("profile.gender")}
          onChange={handleChange("profile.gender")}
        />
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
          style={{
            backgroundColor: isValid ? Colors.primary : Colors.grey,
          }}
        >
          <Text className="text-white font-poppins">
            {t("auth.next_action")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
