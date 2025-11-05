import { useFormik } from "formik";
import { router } from "expo-router";
import { object, string } from "yup";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { formActions } from "../../../store/form";
import { useAppDispatch, useAppSelector } from "../../../store";

export default function SignupWithEmailScreen() {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();

  const dispatch = useAppDispatch();
  const { signup } = useAppSelector((state) => state.form);

  const validationSchema = object().shape({
    email: string().email().required(),
  });

  const {
    values,
    isValid,
    isSubmitting,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    errors,
  } = useFormik({
    validationSchema,
    validateOnMount: true,
    initialValues: {
      email: signup?.email,
    },
    onSubmit(values, { setSubmitting }) {
      dispatch(formActions.updateSignupForm(values));
      router.push("/(auth)/(signup)/password");
      setSubmitting(false);
    },
  });

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flex: 1 }}
      style={{ marginBottom: bottom, flex: 1, paddingHorizontal: 24 }}
    >
      <View className="flex-1 gap-y-8 mt-8">
        <View className="gap-y-1">
          <Text className="text-white text-2xl leading-tight -tracking-8 font-poppins-semibold">
            {t("auth.signup.title")}
          </Text>
          <Text className="text-white/70 font-poppins">
            {t("auth.signup.subtitle")}
          </Text>
        </View>
        <Input
          error={touched.email && errors.email}
          label={t("auth.email_input")}
          inputAttrs={{
            value: values.email,
            autoCorrect: false,
            autoComplete: "email",
            autoCapitalize: "none",
            onBlur: handleBlur("email"),
            keyboardType: "email-address",
            placeholder: "Chucks@gmail.com",
            onChangeText: handleChange("email"),
          }}
        />
      </View>
      <Button
        disabled={!isValid}
        submitting={isSubmitting}
        text={t("auth.next_action")}
        onPress={() => handleSubmit()}
      />
    </KeyboardAwareScrollView>
  );
}
