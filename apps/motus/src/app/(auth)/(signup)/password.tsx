import { useMemo } from "react";
import { useFormik } from "formik";
import { View, Text } from "react-native";
import { object, ref, string } from "yup";
import { Octicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { createUserWithEmailAndPassword } from "@react-native-firebase/auth";

import { Colors } from "../../../constants";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { formActions } from "../../../store/form";
import RadioInput from "../../../components/RadioInput";
import { getFirebaseErrorMessage } from "../../../utils";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useLoading, useSnackbar, useFirebase } from "../../../providers";

export default function PasswordScreen() {
  const loading = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const { firebase, signIn } = useFirebase();
  const { bottom } = useSafeAreaInsets();

  const dispath = useAppDispatch();
  const { signup } = useAppSelector((state) => state.form);

  const auth = useMemo(() => firebase.auth, [firebase]);

  const conditions = [
    {
      name: "Contain at least 8 characters",
      test: string().trim().min(8).required(),
    },
    {
      name: "Contains both lower and uppercase letters",
      test: string().matches(/[a-z]/).matches(/[A-Z]/).required(),
    },
    {
      name: "Contains at least one number",
      test: string().matches(/\d/).required(),
    },
    {
      name: "Contains at least one symbol",
      test: string()
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .required(),
    },
  ];

  const validationSchema = object().shape({
    password: string()
      .required()
      .min(8)
      .matches(/[a-z]/, "password must contain sslower letters")
      .matches(/[A-Z]/, "password must contain uppercase letters")
      .matches(/\d/, "password must contain at least one number")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        "password must contain at least one symbol",
      ),
    confirmPassword: string()
      .required("")
      .oneOf([ref("password")], "password not equal"),
  });

  const {
    handleChange,
    handleBlur,
    handleSubmit,
    values,
    isValid,
    isSubmitting,
    errors,
    touched,
  } = useFormik({
    validationSchema,
    validateOnMount: true,
    initialValues: {
      password: signup?.password,
      confirmPassword: signup?.password,
    },
    onSubmit(values) {
      dispath(formActions.updateSignupForm(values));
      if (signup?.email) {
        return loading.promise(
          createUserWithEmailAndPassword(auth, signup.email!, values.password!)
            .then((credential) => signIn(credential.user))
            .catch((error) =>
              snackbar.error({ text: getFirebaseErrorMessage(error, t) }),
            ),
          {
            subtitle: "Get things ready...",
          },
        );
      }
    },
  });

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flex: 1 }}
      style={{ flex: 1, paddingHorizontal: 24, marginBottom: bottom }}
    >
      <View className="flex-1 gap-y-8 mt-8">
        <View className="gap-y-1">
          <Text className="text-2xl text-white font-poppins-semibold">
            {t("auth.signup.password.title")}
          </Text>
          <Text className="text-white/70 font-poppins">
            {t("auth.signup.password.subtitle")}
          </Text>
        </View>
        <View className="gap-y-8">
          <Input
            error={touched.password && errors.password}
            label={t("auth.password_input")}
            inputAttrs={{
              value: values.password,
              secureTextEntry: true,
              autoComplete: "password-new",
              onBlur: handleBlur("password"),
              placeholder: "Minimum 6 characters",
              onChangeText: handleChange("password"),
            }}
          />
          <View className="gap-y-8">
            <Input
              error={touched.confirmPassword && errors.confirmPassword}
              label={t("auth.signup.password.confirm_password")}
              inputAttrs={{
                secureTextEntry: true,
                value: values.confirmPassword,
                autoComplete: "password-new",
                placeholder: "Re-type password",
                onBlur: handleBlur("confirmPassword"),
                onChangeText: handleChange("confirmPassword"),
              }}
            />
            <View className="gap-y-2">
              {conditions.map(({ name, test }, index) => {
                const valid = test.isValidSync(values.password);

                return (
                  <View
                    key={index}
                    className="flex-row items-center gap-x-4 s"
                  >
                    <RadioInput
                      value={valid}
                      checkStyle={{
                        backgroundColor: Colors.primary,
                      }}
                      CustomCheckIcon={({ checked, ...props }) => (
                        <Octicons
                          name="check"
                          {...props}
                          color={checked ? "white" : "transparent"}
                        />
                      )}
                    />
                    <Text
                      className="text-sm font-poppins"
                      style={{ color: valid ? "white" : Colors.grey }}
                    >
                      {name}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>
      <View>
        <Button
          disabled={!isValid}
          submitting={isSubmitting}
          text={t("auth.continue_action")}
          onPress={() => handleSubmit()}
        />
      </View>
    </KeyboardAwareScrollView>
  );
}
