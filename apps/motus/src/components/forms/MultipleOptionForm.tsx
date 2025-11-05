import Color from "color";
import { useMemo } from "react";
import { useFormik } from "formik";
import { array, object } from "yup";
import { useTranslation } from "react-i18next";

import { Pressable, Text, View, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../../constants";

type MultipleOptionFormProps<T extends { name: string }> = {
  title: string;
  onNext: (value: T[]) => void;
  data: { title: string; data: T[] }[];
};

export function MultipleOptionForm<T extends { name: string }>({
  title,
  data,
  onNext,
}: MultipleOptionFormProps<T>) {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();

  const initialValues = useMemo(
    () => ({ options: data.map(() => [] as T[]) }),
    [data],
  );

  const { values, isValid, isSubmitting, setFieldValue, handleSubmit } =
    useFormik({
      initialValues,
      validateOnMount: true,
      validationSchema: object().shape({
        options: array(array())
          .min(data.length)
          .test((value) => {
            if (value) return value.some((inner) => inner && inner.length > 0);
            return false;
          }),
      }),
      onSubmit(values) {
        onNext(values.options.flat());
      },
    });

  const disabled = useMemo(
    () => isSubmitting || !isValid,
    [isSubmitting, isValid],
  );

  return (
    <View
      className="flex-1"
      style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: bottom }}
    >
      <FlatList
        data={data}
        style={{ flex: 1 }}
        contentContainerStyle={{ rowGap: 8 }}
        ListHeaderComponent={() => (
          <Text className="text-xl text-white font-poppins-medium">
            {title}
          </Text>
        )}
        renderItem={({ item, index: parentIndex }) => {
          return (
            <View>
              <Text
                className="font-poppins mt-4"
                style={{ color: Colors.grey }}
              >
                {item.title}
              </Text>
              <View className="flex-row flex-wrap gap-x-4 gap-y-2">
                {item.data.map((item, index) => {
                  let value = values.options[parentIndex];

                  const selected = value.find(
                    (data) => data.name === item.name,
                  );

                  return (
                    <Pressable
                      key={index}
                      onPress={() => {
                        if (selected) {
                          value = value.filter(
                            (data) => data.name !== item.name,
                          );
                        } else value.push(item);

                        values.options[parentIndex] = value;
                        setFieldValue("options", values.options);
                      }}
                    >
                      <Text
                        key={index}
                        className="flex-row px-4 py-3 border text-white rounded-full font-poppins"
                        style={{
                          borderColor: selected
                            ? Colors.primary
                            : Colors.border[0],
                          backgroundColor: selected
                            ? Color(Colors.primary).alpha(0.5).hexa()
                            : Colors.darkGray,
                        }}
                      >
                        {item.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        }}
      />

      <Pressable
        disabled={disabled}
        className="items-center justify-center p-4 rounded-md"
        style={{
          backgroundColor: disabled ? Colors.grey : Colors.primary,
        }}
        onPress={() => handleSubmit()}
      >
        <Text className="text-white font-poppins">{t("auth.next_action")}</Text>
      </Pressable>
    </View>
  );
}
