import clsx from "clsx";
import Color from "color";
import { useMemo, useState } from "react";
import type { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, type TextStyle, View } from "react-native";

import { Colors } from "../constants";

type InputProps = {
  label?: string;
  error?: string | boolean;
  LabelIcon?: React.FC<Omit<React.ComponentProps<typeof Ionicons>, "name">>;
  labelAttrs?: React.ComponentProps<typeof Text>;
  inputAttrs?: Omit<React.ComponentProps<typeof TextInput>, "value"> & {
    value: any;
    focusStyle?: TextStyle;
  };
  InputWrapper?: (props: React.PropsWithChildren) => React.ReactNode;
} & React.ComponentProps<typeof View>;

export default function Input({
  label,
  inputAttrs,
  labelAttrs,
  error,
  ...props
}: InputProps) {
  const [isFocus, setIsFocus] = useState(false);

  const textProps = useMemo(
    () => ({
      autoCapitalize: "none" as const,
      placeholderTextColor: Colors.inputPlaceholderTextColor,
      ...inputAttrs,
    }),
    [inputAttrs],
  );

  const Input = useMemo(
    () => (
      <TextInput
        {...textProps}
        cursorColor={Colors.primary}
        selectionColor={Colors.primary}
        underlineColorAndroid="transparent"
        selectionHandleColor={Colors.primary}
        className={clsx("transition-all", textProps.className)}
        style={[
          {
            color: "white",
            borderBottomWidth: 1,
            minHeight: 36,
            fontFamily: "Poppins_400Regular",
            borderColor: isFocus
              ? Colors.primary
              : Colors.inputPlaceholderTextColor,
          },
          textProps.style
            ? isFocus
              ? [textProps.style, textProps.focusStyle]
              : textProps.style
            : undefined,
        ]}
        onFocus={(event) => {
          setIsFocus(true);
          textProps.onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocus(false);
          textProps.onBlur?.(event);
        }}
      />
    ),
    [textProps, isFocus, textProps.value],
  );

  return (
    <View
      {...props}
      style={[
        { rowGap: 2 },
        props.style instanceof Function ? props.style : props.style,
      ]}
    >
      {label && (
        <View
          style={{ flexDirection: "row", columnGap: 8, alignItems: "center" }}
        >
          {props.LabelIcon && <props.LabelIcon />}
          <Text
            {...labelAttrs}
            lineBreakMode="clip"
            numberOfLines={1}
            ellipsizeMode="middle"
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
      {props.InputWrapper ? (
        <props.InputWrapper>{Input}</props.InputWrapper>
      ) : (
        Input
      )}
      {error && typeof error === "string" && (
        <Text className="text-red-500 font-poppins">
          {error.slice(0, 1).toLocaleUpperCase()}
          {error.slice(1)}
        </Text>
      )}
    </View>
  );
}
