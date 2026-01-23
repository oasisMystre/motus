import { View, Pressable, TextInput } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type IncrementInputProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function IncrementInput({
  value,
  onChange,
}: IncrementInputProps) {
  return (
    <View className="flex flex-row items-center gap-x-2">
      <Pressable className="p-1 bg-stone-300 rounded-md">
        <MaterialCommunityIcons
          name="minus"
          color="black"
          size={16}
          onPress={() => onChange(value - 1)}
        />
      </Pressable>
      <TextInput
        value={value.toString()}
        keyboardType="numeric"
        style={{ color: "white" }}
        className="border border-stone-500 p-2 rounded-md"
        placeholder="1"
        onChangeText={(value) => onChange(parseFloat(value))}
      />
      <Pressable className="p-1 bg-stone-300 rounded-md">
        <Ionicons
          name="add"
          color="black"
          size={16}
          onPress={() => onChange(value + 1)}
        />
      </Pressable>
    </View>
  );
}
