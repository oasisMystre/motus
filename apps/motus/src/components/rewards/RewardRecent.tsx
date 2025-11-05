import type z from "zod";
import Color from "color";
import { Text } from "react-native";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { rewardSelectSchema } from "@motus/server";
import { LinearGradient } from "expo-linear-gradient";

import { Colors } from "../../constants";

type RewardRecentProps = {
  reward: z.infer<typeof rewardSelectSchema>;
};

export function RewardRecent({ reward }: RewardRecentProps) {
  return (
    <View className="flex-row items-center gap-x-4">
      <LinearGradient
        colors={[Color(Colors.primary).whiten(0.7).hexa(), Colors.primary]}
        style={{
          width: 32,
          height: 32,
          borderRadius: 100,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          size={18}
          color="white"
          name="gift-outline"
        />
      </LinearGradient>
      <View className="flex-1">
        <Text className="text-white">
          {reward.type.title.slice(0, 1).toUpperCase()}
          {reward.type.title.slice(1)}
        </Text>
        <Text
          className="text-sm"
          style={{ color: Colors.subtitleColor }}
        >
          {reward.type.description}
        </Text>
      </View>
      <Text className="text-lg text-white font-poppins-semibold">
        +{reward.type.point} MOTUS
      </Text>
    </View>
  );
}
