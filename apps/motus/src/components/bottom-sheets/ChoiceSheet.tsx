import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, View, Text } from "react-native";
import type { PickerItem } from "@quidone/react-native-wheel-picker";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { Colors } from "../../constants";
import DropdownPicker from "../forms/DropdownPicker";

type ChoiceSheetProps<T extends PickerItem<string>> = {
  title?: string;
  choices: T[];
  value?: T["value"];
  onValueChange: (value: T["value"]) => void;
} & Omit<React.ComponentProps<typeof BottomSheet>, "children">;

export function ChoiceSheet<T extends PickerItem<string>>({
  title,
  choices,
  onClose,
  onValueChange,
  value: _value,
  ...props
}: ChoiceSheetProps<T>) {
  const [value, setValue] = useState(_value ?? choices[0]?.value);

  return (
    <BottomSheet
      {...props}
      backgroundStyle={{ backgroundColor: Colors.background[3] }}
      handleComponent={() => (
        <View
          className="flex-row items-center"
          style={{ borderBottomWidth: 1, borderBottomColor: Colors.darkGray }}
        >
          <Pressable
            className="p-4"
            onPress={onClose}
          >
            <MaterialIcons
              name="close"
              size={24}
              color="white"
            />
          </Pressable>
          {title && (
            <Text className="flex-1 text-lg text-center text-white font-poppins-medium">
              {title}
            </Text>
          )}
          <Pressable
            className="ml-auto p-4"
            onPress={() => {
              onValueChange(value);
              onClose?.();
            }}
          >
            <MaterialIcons
              name="check"
              size={24}
              color="white"
            />
          </Pressable>
        </View>
      )}
      handleIndicatorStyle={{ backgroundColor: Colors.grey, width: 64 }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          onPress={() => onClose?.()}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
    >
      <BottomSheetView style={{ paddingTop: 8 }}>
        <DropdownPicker
          value={value}
          data={choices}
          onValueChanged={({ item: { value } }) => setValue(value)}
        />
      </BottomSheetView>
    </BottomSheet>
  );
}
