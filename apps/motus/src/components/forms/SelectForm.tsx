import clsx from "clsx";
import Color from "color";
import { useMemo } from "react";
import { useFormik } from "formik";
import { array, object, type Schema } from "yup";
import { useTranslation } from "react-i18next";

import { Pressable, Text, View, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import RadioInput from "../RadioInput";
import { Colors } from "../../constants";
import CheckboxInput from "../CheckboxInput";

type SelectFormProps<T extends { name: string; description?: string }> = {
  title: string;
  subtitle?: string;
  listTitle?: string;
  options: T[];
  type?: "check" | "radio";
  validationSchema?: Schema;
  onSubmit: (data: T[]) => Promise<void>;
};

export function SelectForm<T extends { name: string; description?: string }>({
  options,
  title,
  subtitle,
  type,
  onSubmit,
  validationSchema,
  listTitle,
}: SelectFormProps<T>) {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();

  const { values, isValid, isSubmitting, setFieldValue, handleSubmit } =
    useFormik({
      validateOnMount: true,
      validationSchema: validationSchema
        ? validationSchema
        : object({
            options:
              type === "check"
                ? array().min(1).required()
                : array().min(1).max(1).required(),
          }),
      initialValues: {
        options: [] as T[],
      },
      onSubmit(values) {
        return onSubmit(values.options);
      },
    });

  const disabled = useMemo(
    () => isSubmitting || !isValid,
    [isSubmitting, isValid],
  );

  return (
    <FlatList
      data={options}
      className="px-6"
      style={{ flex: 1, paddingBottom: bottom }}
      contentContainerStyle={{ rowGap: 8 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={() => (
        <View className="gap-y-8 mt-6">
          <View className="">
            <Text className="text-xl text-white font-poppins-medium">
              {title}
            </Text>
            {subtitle && <Text style={{ color: Colors.grey }}>{subtitle}</Text>}
          </View>
          {listTitle && <Text style={{ color: Colors.grey }}>{listTitle}</Text>}
        </View>
      )}
      renderItem={({ item }) => {
        const value = Boolean(
          values.options.find((value) => item.name === value.name),
        );

        return (
          <Pressable
            className="flex-row px-4 py-6 rounded-lg"
            style={{
              backgroundColor: Color(Colors.listItemColor).alpha(0.5).hexa(),
            }}
            onPress={() => {
              if (type === "radio") setFieldValue("options", [item]);
              else if (value) {
                const rest = values.options.filter(
                  (value) => item.name !== value.name,
                );
                setFieldValue("options", rest);
              } else setFieldValue("options", values.options.concat(item));
            }}
          >
            <View className="flex-1">
              <Text
                className={clsx(
                  "text-white",
                  item.description ? "font-poppins-medium" : "font-poppins",
                )}
              >
                {item.name}
              </Text>
              {item.description && (
                <Text
                  className="text-sm text-white font-poppins"
                  style={{ color: Colors.grey }}
                >
                  {item.description}
                </Text>
              )}
            </View>
            {type === "radio" ? (
              <RadioInput value={value} />
            ) : (
              <CheckboxInput value={value} />
            )}
          </Pressable>
        );
      }}
      ListFooterComponent={() => (
        <Pressable
          disabled={disabled}
          className="items-center justify-center p-4 rounded-md my-8"
          style={{ backgroundColor: disabled ? Colors.grey : Colors.primary }}
          onPress={() => handleSubmit()}
        >
          <Text className="text-white font-poppins">
            {t("auth.next_action")}
          </Text>
        </Pressable>
      )}
    />
  );
}
