import clsx from "clsx";
import { CheckIcon } from "phosphor-react-native";
import { Pressable, type StyleProp, View, type ViewStyle } from "react-native";

import { Colors } from "../constants";

type CheckboxInputProps = {
  value: boolean;
  showCheck?: boolean;
  onChange?: (value: boolean) => void;
  checkContainerStyle?: (value: boolean) => StyleProp<ViewStyle>;
} & React.ComponentProps<typeof Pressable>;

export default function CheckboxInput({
  value,
  onChange,
  showCheck,
  checkContainerStyle,
  ...props
}: CheckboxInputProps) {
  return (
    <Pressable
      {...props}
      onPressIn={(event) => {
        if (onChange) onChange(!value);
        if (props.onPressIn) props.onPressIn(event);
      }}
    >
      <View
        className={clsx(
          "size-6 items-center justify-center border rounded transition-all",
          value && " bg-primary border-transparent",
        )}
        style={[
          { borderColor: value ? "transparent" : Colors.grey },
          checkContainerStyle?.(value),
        ]}
      >
        <CheckIcon
          size={18}
          color="white"
          style={{
            opacity: showCheck ? 1 : value ? 1 : 0,
            transform: [{ scale: showCheck ? 1 : value ? 1 : 0 }],
          }}
        />
      </View>
    </Pressable>
  );
}
