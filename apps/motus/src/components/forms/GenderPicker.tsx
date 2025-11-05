import Color from "color";
import {
  type NativeSyntheticEvent,
  Pressable,
  type TargetedEvent,
  Text,
  View,
} from "react-native";

import RadioInput from "../RadioInput";
import { Colors } from "../../constants";

export const genders = ["male", "female"] as const;

export type Gender = (typeof genders)[number] | "others";

type GenderPickerProps = {
  value?: Gender | null;
  onBlur: (e?: NativeSyntheticEvent<TargetedEvent>) => void;
  onChange: (value: Gender) => void;
};

export default function GenderPicker({
  value,
  onChange,
  onBlur,
}: GenderPickerProps) {
  return (
    <View className="flex-row gap-x-4">
      {genders.map((gender, index) => {
        const selected = value === gender;

        return (
          <Pressable
            key={index}
            className="flex-1 flex-row items-center justify-center"
            onPress={() => onChange(gender)}
            onBlur={onBlur}
          >
            <View
              className="flex-1 flex-row px-4 py-6 rounded-md"
              style={{
                backgroundColor: Color(Colors.darkGray).alpha(0.5).hexa(),
              }}
            >
              <Text className="flex-1 text-white capitalize">{gender}</Text>
              <RadioInput value={selected} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
