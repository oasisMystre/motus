import { memo } from "react";
import WheelPicker, {
  type PickerItem,
} from "@quidone/react-native-wheel-picker";

type DropdownPickerProps<T extends PickerItem<unknown>[]> = {
  data: T;
  value?: T[number]["value"];
} & Omit<React.ComponentProps<typeof WheelPicker>, "onValueChange" | "data">;

export default memo(function DropdownPicker<T extends PickerItem<unknown>[]>({
  value,
  onValueChanged,
  ...props
}: DropdownPickerProps<T>) {
  return (
    <WheelPicker
      {...props}
      value={value}
      onValueChanged={onValueChanged}
      enableScrollByTapOnItem
      itemTextStyle={[
        { color: "white", fontFamily: "Poppins_400Regular" },
        props.itemTextStyle,
      ]}
    />
  );
});
