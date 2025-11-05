import z from "zod";
import { useMemo } from "react";
import { useFormik } from "formik";
import { View } from "react-native";

import Input from "../../../../components/Input";
import Button from "../../../../components/Button";
import KeyboardView from "../../../../components/KeyboardView";
import { useFirebase, useSnackbar } from "../../../../providers";
import { getFirebaseErrorMessage, withZodSchema } from "../../../../utils";

export default function SetEmailScreen() {
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
    validate: withZodSchema(z.object({ email: z.email() })),
    initialValues: {
      email: "",
    },
    onSubmit(values) {
      return firebase.auth.currentUser
        ?.updateEmail(values.email)
        .then(() => snackbar.success({ text: "Email updated successfully" }))
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
          label="Email"
          style={{ rowGap: 8 }}
          error={touched.email && errors.email}
          inputAttrs={{
            value: values.email,
            inputMode: "email",
            autoComplete: "email",
            keyboardType: "email-address",
            textContentType: "emailAddress",
            placeholder: "New email address",
            onBlur: handleBlur("email"),
            onChangeText: handleChange("email"),
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
