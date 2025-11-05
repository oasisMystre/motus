import { useEffect } from "react";
import WheelPicker, {
  type PickerItem,
} from "@quidone/react-native-wheel-picker";

type DropdownPickerProps<T extends PickerItem<unknown>[]> = {
  data: T;
  value?: T[number]["value"];
} & Omit<React.ComponentProps<typeof WheelPicker>, "onValueChange" | "data">;
export default function DropdownPicker<T extends PickerItem<unknown>[]>({
  value,
  ...props
}: DropdownPickerProps<T>) {
  useEffect(() => {
    props.onValueChanged?.({ item: props.data[0], index: 0 });
  }, []);

  return (
    <WheelPicker
      {...props}
      value={value}
      enableScrollByTapOnItem
      itemTextStyle={[
        { color: "white", fontFamily: "Poppins_400Regular" },
        props.itemTextStyle,
      ]}
    />
  );
}
