import type z from "zod";
import { View, Text } from "react-native";

import { Colors } from "../../constants";
import type { rewardSelectSchema } from "@motus/server";

type RewardItemProps = {
  reward: z.infer<typeof rewardSelectSchema>;
};

export function RewardItem({ reward }: RewardItemProps) {
  return (
    <View
      className="flex-row px-3 py-2 rounded-md"
      style={{ backgroundColor: Colors.listItemColor }}
    >
      <View className="flex-1">
        <Text className="text-white font-poppins-medium">
          {reward.type.title.slice(0, 1).toUpperCase()}
          {reward.type.title.slice(1)}
        </Text>
        <Text
          numberOfLines={1}
          className="text-sm text-white font-poppins"
          style={{ color: Colors.subtitleColor }}
        >
          {reward.type.description}
        </Text>
      </View>
      <View>
        <Text className="text-white font-poppins-medium">
          +{reward.type.point} MOTUS
        </Text>
      </View>
    </View>
  );
}
