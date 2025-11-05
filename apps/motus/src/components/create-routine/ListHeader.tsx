import type z from "zod";
import { View, Text } from "react-native";
import { useFormikContext } from "formik";
import { BarbellIcon } from "phosphor-react-native";
import type { routineInsertSchema, exerciseSelectSchema } from "@motus/server";

import Input from "../Input";
import { Colors } from "../../constants";
import { memo } from "react";

type ListHeaderProps = {
  exercises: z.infer<typeof routineInsertSchema>["metadata"]["exercises"];
};

export const ListHeader = memo(({ exercises }: ListHeaderProps) => {
  const { touched, errors, values, handleBlur, handleChange } =
    useFormikContext<z.infer<typeof exerciseSelectSchema>>();

  return (
    <View className="gap-y-16">
      <Input
        label="Routine title"
        error={touched.name && errors.name}
        labelAttrs={{
          style: {
            marginBottom: 4,
          },
        }}
        inputAttrs={{
          value: values.name,
          placeholder: "Morning Exercise Routine",
          focusStyle: { borderColor: Colors.primary },
          onBlur: handleBlur("name"),
          onChangeText: handleChange("name"),
          style: {
            height: 48,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 16,
          },
        }}
      />
      {exercises.length < 1 && (
        <View className="items-center justify-center gap-y-4">
          <BarbellIcon
            size={48}
            weight="thin"
            color={Colors.text[0]}
          />
          <Text
            className="font-poppins text-center"
            style={{ color: Colors.text[0] }}
          >
            Get started by adding an exercise to your routine.
          </Text>
        </View>
      )}
    </View>
  );
});
