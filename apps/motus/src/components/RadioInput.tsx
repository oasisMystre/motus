import clsx from "clsx";
import type { Octicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import {
  Pressable,
  type StyleProp,
  type View,
  type ViewStyle,
} from "react-native";

import { Colors } from "../constants";

type RadioInputProps = {
  value: boolean;
  onChange?: (value: boolean) => void;
  checkClassName?: string;
  unCheckClassName?: string;
  checkStyle?: StyleProp<ViewStyle>;
  unCheckStyle?: StyleProp<ViewStyle>;
  innerAttrs?: {
    checkClassName?: string;
    unCheckClassName?: string;
    checkStyle?: StyleProp<ViewStyle>;
    unCheckStyle?: StyleProp<ViewStyle>;
  };
  CustomCheckIcon?: (
    props: Omit<React.ComponentProps<typeof Octicons>, "name"> & {
      checked: boolean;
    },
  ) => React.ReactNode;
} & React.ComponentProps<typeof View>;

export default function RadioInput({
  value,
  onChange,
  CustomCheckIcon,
  checkClassName,
  unCheckClassName,
  checkStyle,
  unCheckStyle,
  innerAttrs,
  ...props
}: RadioInputProps) {
  return (
    <Pressable
      onPress={() => {
        if (onChange) onChange(!value);
      }}
    >
      <Animated.View
        {...props}
        className={clsx(
          "relative size-6 flex flex-row items-center justify-center border-2 p-2 rounded-3xl",
          props.className,
          value ? checkClassName : unCheckClassName,
        )}
        style={[
          { borderColor: value ? Colors.primary : Colors.grey },
          props.style,
          value ? checkStyle : unCheckStyle,
        ]}
      >
        {CustomCheckIcon ? (
          <CustomCheckIcon
            checked={value}
            className={clsx(
              "absolute size-3 transition-all",
              value ? "opacity-1" : "opacity-0",
              value ? innerAttrs?.checkClassName : innerAttrs?.unCheckClassName,
            )}
            color="red"
          />
        ) : (
          <Animated.View
            className={clsx(
              "size-3  rounded-full transition-all",
              value ? "bg-primary opacity-1" : "opacity-0",
              value ? innerAttrs?.checkClassName : innerAttrs?.unCheckClassName,
            )}
            style={value ? innerAttrs?.checkStyle : innerAttrs?.unCheckStyle}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}
