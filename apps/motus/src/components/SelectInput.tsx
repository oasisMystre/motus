import Color from "color";
import { isString } from "formik";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  ScrollView,
  Text,
  type TextInput,
  type TextStyle,
  View,
} from "react-native";

import { Colors } from "../constants";
import { CaretRightIcon } from "phosphor-react-native";

type SelectInputProps<T extends { name: string }> = {
  label?: string;
  values?: T[];
  error?: string | boolean;
  onValueChange?: (values: T[]) => void;
  LabelIcon?: React.FC<Omit<React.ComponentProps<typeof Ionicons>, "name">>;
  labelAttrs?: React.ComponentProps<typeof Text>;
  inputAttrs?: React.ComponentProps<typeof TextInput> & {
    focusStyle?: TextStyle;
  };
} & React.ComponentProps<typeof Pressable>;

export default function SelectInput<T extends { name: string }>({
  label,
  inputAttrs,
  labelAttrs,
  error,
  values,
  onValueChange,
  ...props
}: SelectInputProps<T>) {
  return (
    <View>
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
        {...props}
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 4,
            rowGap: 2,
            borderBottomWidth: 1,
            borderColor: Colors.inputPlaceholderTextColor,
          },
          props.style instanceof Function
            ? props.style({
                pressed: false,
                hovered: false,
              })
            : props.style,
        ]}
      >
        {values && values.length > 0 ? (
          <ScrollView
            horizontal
            className="flex-1 flex-row gap-x-4"
          >
            {values.map((value, index) => (
              <Pressable
                key={index}
                className="flex-row items-center gap-x-2 px-2 py-1 rounded-full mr-2"
                style={{
                  backgroundColor: Colors.darkGray,
                }}
              >
                <Text
                  style={[
                    {
                      color: "white",
                      fontFamily: "Poppins_400Regular",
                    },
                    inputAttrs?.style,
                  ]}
                >
                  {value.name}
                </Text>
                <Pressable
                  onPress={() => {
                    if (onValueChange) {
                      if (!values) values = [];
                      values = values.filter(
                        (data) => value.name !== data.name,
                      );
                      onValueChange(values);
                    }
                  }}
                >
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={Colors.grey}
                  />
                </Pressable>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <Text
            style={[
              {
                flex: 1,
                color: Colors.primary,
                fontFamily: "Poppins_400Regular",
              },
              inputAttrs?.style,
            ]}
          >
            {inputAttrs?.placeholder}
          </Text>
        )}
        <CaretRightIcon
          color="white"
          size={16}
        />
      </Pressable>
      {error && isString(error) && (
        <Text className="text-red-500 font-poppins">
          {error.slice(0, 1).toLocaleUpperCase()}
          {error.slice(1)}
        </Text>
      )}
    </View>
  );
}
