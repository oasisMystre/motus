import { View, Text } from "react-native";

import { Colors } from "../../constants";
import FireIcon from "../../assets/fire-icon";

type StreakInfoProps = {
  value?: number;
};

export function StreakInfo({ value }: StreakInfoProps) {
  return (
    <View className="relative">
      <View className="absolute -top-0.5 inset-x-0 h-4 bg-primary rounded-t-full" />
      <View
        className="flex-row gap-x-4 items-center border-t p-3 rounded-b-lg"
        style={{
          borderRadius: 12,
          backgroundColor: Colors.background[0],
        }}
      >
        <FireIcon
          color="yellow"
          width={33}
          height={33}
        />
        <View className="flex-1">
          <Text className="text-white font-poppins">Longest Streak</Text>
          <Text
            className="font-poppins"
            style={{ color: Colors.subtitleColor }}
          >
            {value} days
          </Text>
        </View>
      </View>
    </View>
  );
}
