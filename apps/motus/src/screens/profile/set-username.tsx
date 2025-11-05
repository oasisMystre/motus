import type z from "zod";
import { useMemo } from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import type { userSelectSchema } from "@motus/server";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../../constants";
import Input from "../../components/Input";
import useDimensions from "../../hooks/useDimensions";
import { CircularBackButton } from "../../components/Header";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type SetUsernameScreenProps = {
  goBack: () => void;
  next: () => void;
};

export function SetUsernameScreen({ goBack, next }: SetUsernameScreenProps) {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const { width } = useDimensions("window");

  const { values, handleChange, handleBlur } =
    useFormikContext<Partial<z.infer<typeof userSelectSchema>>>();

  const isValid = useMemo(() => values.username, [values]);

  return (
    <KeyboardAwareScrollView
      contentContainerClassName="flex-1 px-6"
      style={{ width, marginBottom: bottom }}
    >
      <View className="flex-1 gap-y-8 pt-8">
        <View>
          <Text className="text-xl text-white font-poppins-semibold">
            {t("auth.profile.set_username.title")}
          </Text>
          <Text
            className="font-poppins"
            style={{
              color: Colors.grey,
            }}
          >
            {t("auth.profile.set_username.subtitle")}
          </Text>
        </View>
        <View className="flex-1">
          <View className="gap-y-2">
            <Input
              label={t("auth.profile.set_username.input_label")}
              labelAttrs={{
                style: {
                  color: Colors.grey,
                },
              }}
              inputAttrs={{
                value: values.username,
                placeholder: "johndoe",
                autoCorrect: false,
                autoComplete: "username-new",
                onBlur: handleBlur("username"),
                onChangeText: handleChange("username"),
                className: "py-4 px-2 rounded-md",
                focusStyle: { borderColor: Colors.primary },
                style: { borderWidth: 1, borderColor: Colors.grey },
              }}
            />
          </View>
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
