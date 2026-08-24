import Color from "color";
import { format } from "util";
import { useState } from "react";
import { isString } from "formik";
import capitalize from "lodash.capitalize";
import { Ionicons } from "@expo/vector-icons";

import { CaretRightIcon, CheckIcon } from "phosphor-react-native";
import {
  Pressable,
  Text,
  type TextInput,
  type TextStyle,
  View,
  FlatList,
} from "react-native";

import { Colors } from "../constants";

type MultipleSelectInputProps<T extends { label: string; value: unknown }> = {
  label?: string;
  error?: boolean | string;
  options: T[];
  values?: T["value"][];
  onValueChange: (values: T["value"][]) => void;
  LabelIcon?: React.FC<Omit<React.ComponentProps<typeof Ionicons>, "name">>;
  labelAttrs?: React.ComponentProps<typeof Text>;
  inputAttrs?: React.ComponentProps<typeof TextInput> & {
    focusStyle?: TextStyle;
  };
} & React.ComponentProps<typeof View>;

export default function MultipleSelectInput<
  T extends { label: string; value: unknown },
>({
  label,
  inputAttrs,
  labelAttrs,
  error,
  options,
  values,
  onValueChange,
  ...props
}: MultipleSelectInputProps<T>) {
  const [show, setShow] = useState(false);

  return (
    <View
      {...props}
      style={[{ position: "relative" }, props.style]}
    >
      {label && (
        <View
          style={{ flexDirection: "row", columnGap: 8, alignItems: "center" }}
        >
          {props.LabelIcon && <props.LabelIcon />}
          <Text
            {...labelAttrs}
            style={[
              {
                fontFamily: "Poppins_400Regular",
                color: Color("white").alpha(0.7).hexa(),
              },
              labelAttrs?.style,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
      <Pressable
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 4,
          rowGap: 2,
          borderBottomWidth: 1,
          borderColor: Colors.inputPlaceholderTextColor,
        }}
        onPress={() => setShow(!show)}
      >
        <View className="flex-1 flex-row gap-x-2">
          {values && values.length > 0 ? (
            values.map((value, index) => {
              const option = options.find((option) => option.value === value);

              return (
                option && (
                  <View
                    key={index}
                    className="flex-row items-center gap-x-2 px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: Colors.darkGray,
                    }}
                  >
                    <Text
                      className="text-white font-poppins"
                      style={inputAttrs?.style}
                    >
                      {capitalize(option.label)}
                    </Text>
                    <Pressable
                      onPress={() => {
                        if (values) {
                          values = values.filter((data) => data !== value);
                          onValueChange(values);
                        }
                      }}
                    >
                      <Ionicons
                        name="close-circle"
                        color={Colors.grey}
                        size={16}
                      />
                    </Pressable>
                  </View>
                )
              );
            })
          ) : (
            <Text
              style={inputAttrs?.style}
              className="font-poppins text-primary"
            >
              {inputAttrs?.placeholder}
            </Text>
          )}
        </View>
        <CaretRightIcon
          color="white"
          size={16}
          style={{ transform: [{ rotate: format("%ddeg", show ? 90 : 0) }] }}
        />
      </Pressable>
      {error && isString(error) && (
        <Text className="text-red-500 font-poppins">{capitalize(error)}</Text>
      )}
      {show && (
        <FlatList
          data={options}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -(options!.length * 32),
            maxHeight: 132,
            backgroundColor: Colors.background[4],
          }}
          renderItem={({ item, index }) => {
            const selected = values?.find((value) => item.value === value);

            return (
              <Pressable
                className="flex-row items-center"
                onPress={() => {
                  setShow(false);
                  if (!values) values = [];

                  if (selected)
                    values = values.filter((value) => value !== item.value);
                  else values.push(item.value);
                  onValueChange(values);
                }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderBottomWidth: 1,
                  backgroundColor: selected
                    ? Color(Colors.darkGray).hexa()
                    : "transparent",
                  borderColor:
                    options && options.length > 0 && index < options.length - 1
                      ? Colors.border[1]
                      : "transparent",
                }}
              >
                <Text className="flex-1 text-white">
                  {capitalize(item.label)}
                </Text>
                {selected && (
                  <CheckIcon
                    size={14}
                    color={Colors.primary}
                  />
                )}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
