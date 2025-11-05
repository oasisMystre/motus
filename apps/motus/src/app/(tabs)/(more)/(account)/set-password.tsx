import z from "zod";
import { useMemo } from "react";
import { useFormik } from "formik";
import { View } from "react-native";

import Input from "../../../../components/Input";
import Button from "../../../../components/Button";
import KeyboardView from "../../../../components/KeyboardView";
import { useFirebase, useSnackbar } from "../../../../providers";
import { getFirebaseErrorMessage, withZodSchema } from "../../../../utils";

export default function SetPasswordScreen() {
  const snackbar = useSnackbar();
  const { firebase } = useFirebase();

  const {
    touched,
    errors,
    isValid,
    isSubmitting,
    values,
    handleBlur,
    handleChange,
    handleSubmit,
  } = useFormik({
    validateOnMount: true,
    validate: withZodSchema(z.object({ password: z.string() })),
    initialValues: {
      password: "",
    },
    onSubmit(values, { resetForm }) {
      return firebase.auth.currentUser
        ?.updatePassword(values.password)
        .then(() => {
          resetForm();
          return snackbar.success({ text: "Password updated successfully" });
        })
        .catch((error) =>
          snackbar.error({ text: getFirebaseErrorMessage(error) }),
        );
    },
  });

  const disabled = useMemo(
    () => !isValid || isSubmitting,
    [isValid, isSubmitting],
  );

  return (
    <KeyboardView style={{ marginTop: 16 }}>
      <View className="flex-1 gap-y-16">
        <Input
          label="Password"
          style={{ rowGap: 8 }}
          error={touched.password && errors.password}
          inputAttrs={{
            value: values.password,
            secureTextEntry: true,
            autoComplete: "off",
            placeholder: "New password",
            onChangeText: handleChange("password"),
            onBlur: handleBlur("password"),
            style: { height: 48, borderWidth: 1, padding: 8, borderRadius: 8 },
          }}
        />
        <Button
          text="Update"
          disabled={disabled}
          submitting={isSubmitting}
          onPress={() => handleSubmit()}
        />
      </View>
    </KeyboardView>
  );
}
