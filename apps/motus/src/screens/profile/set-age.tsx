import type z from "zod";
import moment from "moment";
import { useMemo } from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import type { userSelectSchema } from "@motus/server";
import { Pressable, Text, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

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
    useFormikContext<z.infer<typeof userSelectSchema>>();
  const isValid = useMemo(() => values.profile.age, [values]);

  return (
    <KeyboardAwareScrollView
      contentContainerClassName="flex-1 px-6"
      style={{ width, marginBottom: bottom }}
    >
      <View className="flex-1 gap-y-8 pt-8">
        <View>
          <Text className="text-xl text-white font-poppins-semibold">
            {t("auth.profile.set_age.title")}
          </Text>
        </View>
        <View className="flex-1">
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
              value: moment(moment())
                .diff(moment(values.profile.age), "year")
                .toString(),
              onBlur: handleBlur("profile.age"),
              onChangeText(text) {
                const year = parseFloat(text);
                if (!Number.isNaN(year))
                  setFieldValue(
                    "profile.age",
                    moment().subtract(year, "year").toDate(),
                  );
              },
              className: "py-4 px-2 rounded-md",
              focusStyle: { borderColor: Colors.primary },
              style: { borderWidth: 1, borderColor: Colors.grey },
            }}
          />
        </View>
        {Platform.OS === "ios" && (
          <RNDateTimePicker
            mode="date"
            display="spinner"
            textColor="white"
            themeVariant="dark"
            accentColor={Colors.primary}
            style={{ backgroundColor: "transparent" }}
            value={values.profile.age!}
            onChange={(_, date) => {
              if (date) setFieldValue("profile.age", date);
            }}
          />
        )}
      </View>
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
    </KeyboardAwareScrollView>
  );
}
