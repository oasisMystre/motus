import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { Colors } from "../constants";

type ButtonProps = {
  text: string;
  icon?: React.ReactNode;
  submitting?: boolean;
  textAttrs?: React.ComponentProps<typeof Text>;
} & React.ComponentProps<typeof Pressable>;

export default function Button({
  text,
  icon,
  textAttrs,
  submitting,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      {...props}
      style={[
        style.button,
        props.disabled && style["button:disabled"],
        props.style instanceof Function
          ? props.style({
              pressed: false,
              hovered: false,
            })
          : props.style,
      ]}
      disabled={props.disabled || submitting}
    >
      {submitting ? <ActivityIndicator color="white" /> : icon}
      <Text
        {...textAttrs}
        numberOfLines={1}
        style={[style.text, textAttrs?.style]}
      >
        {text}
      </Text>
    </Pressable>
  );
}

const style = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    columnGap: 8,
    backgroundColor: Colors.primary,
  },
  "button:disabled": {
    backgroundColor: Colors.grey,
  },
  text: {
    color: "white",
    fontFamily: "Poppins_400Regular",
  },
});
