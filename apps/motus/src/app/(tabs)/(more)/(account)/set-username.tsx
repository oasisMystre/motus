import z from "zod";
import { useMemo } from "react";
import { useFormik } from "formik";
import { View } from "react-native";

import Input from "../../../../components/Input";
import { withZodSchema } from "../../../../utils";
import Button from "../../../../components/Button";
import { useLoading, useSnackbar } from "../../../../providers";
import KeyboardView from "../../../../components/KeyboardView";
import { useTRPCClient } from "../../../../providers/TRPCProvider";

export default function SetUserNameScreen() {
  const trpc = useTRPCClient();
  const snackbar = useSnackbar();
  const loading = useLoading();

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
    validate: withZodSchema(z.object({ username: z.string() })),
    initialValues: {
      username: "",
    },
    async onSubmit(values, { resetForm }) {
      return trpc.user.update
        .mutate(values)
        .then(() => {
          resetForm();
          return snackbar.success({ text: "Username updated successfully" });
        })
        .catch(() =>
          snackbar.error({ text: "Username already in used by another user" }),
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
          label="Username"
          style={{ rowGap: 8 }}
          error={touched.username && errors.username}
          inputAttrs={{
            value: values.username,
            autoComplete: "username-new",
            placeholder: "New username",
            onBlur: handleBlur("username"),
            onChangeText: handleChange("username"),
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
