import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, View, Text } from "react-native";
import { RulerPicker } from "react-native-ruler-picker";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { Colors } from "../../constants";

type UnitSheetProps<T extends string> = {
  unit?: T;
  title?: string;
  units: T[];
  value?: number;
  onValueChange: (unit: T, value: number) => void;
  header?: React.ReactNode;
  rulerPickerAttrs?: Omit<
    React.ComponentProps<typeof RulerPicker>,
    "unit" | "value" | "children"
  >;
} & Omit<React.ComponentProps<typeof BottomSheet>, "children">;

export function UnitSheet<T extends string>({
  units,
  title,
  unit: _unit,
  value: _value,
  onClose,
  header,
  rulerPickerAttrs,
  onValueChange,
  ...props
}: UnitSheetProps<T>) {
  const [value, setValue] = useState(_value ?? 0);
  const [unit, setUnit] = useState(_unit ?? units?.[0]);

  return (
    <BottomSheet
      {...props}
      snapPoints={["50%"]}
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
              onValueChange(unit, value);
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
        {header}
        <View
          className="flex-row mx-6 rounded-lg overflow-hidden"
          style={{ backgroundColor: Colors.gray }}
        >
          {units.map((value, index) => {
            const selected = unit === value;

            return (
              <Pressable
                key={index}
                className="flex-1 p-2 rounded-lg"
                style={{
                  backgroundColor: selected ? Colors.primary : "transparent",
                }}
                onPress={() => setUnit(value)}
              >
                <Text className="text-center text-white font-poppins uppercase">
                  {value}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <RulerPicker
          min={0}
          max={240}
          step={0.1}
          unit={unit}
          height={360}
          fractionDigits={1}
          initialValue={value}
          indicatorHeight={40}
          indicatorColor={Colors.grey}
          unitTextStyle={{ color: "white" }}
          valueTextStyle={{ color: "white" }}
          onValueChange={(number) => setValue(parseFloat(number))}
          onValueChangeEnd={(number) => setValue(parseFloat(number))}
          {...rulerPickerAttrs}
        />
      </BottomSheetView>
    </BottomSheet>
  );
}
