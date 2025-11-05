import { View, Pressable, Text } from "react-native";

import { Colors } from "../../constants";

export function RewardMultiplier() {
  return (
    <View>
      <Text className="text-white font-poppins-bold">More ways to earn</Text>
      <View className="flex-row items-center gap-x-2">
        <Text style={{ color: Colors.subtitleColor }}>2x your Rewards in</Text>
        <Pressable className="text-primary capitalize">
          <Text className="text-primary uppercase font-poppins-bold">
            PREMIUM
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
