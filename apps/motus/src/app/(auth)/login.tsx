import { Link } from "expo-router";
import { useFormik } from "formik";
import { object, string } from "yup";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "@react-native-firebase/auth";

import Input from "../../components/Input";
import Button from "../../components/Button";
import { getFirebaseErrorMessage } from "../../utils";
import { useSnackbar, useFirebase } from "../../providers";

export default function LoginScreen() {
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { firebase } = useFirebase();
  const { bottom } = useSafeAreaInsets();

  const {
    values,
    isValid,
    isSubmitting,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
  } = useFormik({
    validateOnMount: true,
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: object().shape({
      email: string().email().required(),
      password: string().min(6).required(),
    }),
    onSubmit(values) {
      return signInWithEmailAndPassword(
        firebase.auth,
        values.email.trim(),
        values.password,
      ).catch((error) =>
        snackbar.error({ text: getFirebaseErrorMessage(error, t) }),
      );
    },
  });

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flex: 1 }}
      style={{ marginBottom: bottom, flex: 1, paddingHorizontal: 24 }}
    >
      <View className="flex-1 gap-y-8 mt-8">
        <View>
          <Text className="text-white text-2xl font-poppins-semibold">
            {t("auth.login.title")}
          </Text>
          <Text className="text-white/70 font-poppins">
            {t("auth.login.subtitle")}
          </Text>
        </View>
        <View className="gap-y-4">
          <View className="gap-y-8">
            <Input
              error={touched.email && errors.email}
              label={t("auth.email_input")}
              inputAttrs={{
                value: values.email,
                autoComplete: "email",
                autoCapitalize: "none",
                keyboardType: "email-address",
                onBlur: handleBlur("email"),
                onChangeText: handleChange("email"),
                placeholder: "Chucks@gmail.com",
              }}
            />
            <Input
              error={touched.password && errors.password}
              label={t("auth.password_input")}
              inputAttrs={{
                value: values.password,
                autoComplete: "password",
                autoCapitalize: "none",
                secureTextEntry: true,
                onBlur: handleBlur("password"),
                onChangeText: handleChange("password"),
                placeholder: "Minimum 6 characters",
              }}
            />
          </View>
          <Pressable
            className="self-end"
            onPress={() => {
              sendPasswordResetEmail(firebase.auth, values.email).then(() =>
                snackbar.success({
                  text: "🎉 Email reset link sent successfully",
                }),
              );
            }}
          >
            <Text className="text-sm text-primary">
              {t("auth.login.forgotten_password")}
            </Text>
          </Pressable>
        </View>
      </View>
      <View className="gap-y-2">
        <Button
          disabled={!isValid}
          submitting={isSubmitting}
          text={t("auth.login.action")}
          onPress={() => handleSubmit()}
        />
        <View className="flex-row gap-x-1 items-center justify-center">
          <Link
            href="/(auth)/(signup)"
            className="text-white"
          >
            {t("auth.login.create_account")}
          </Link>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
