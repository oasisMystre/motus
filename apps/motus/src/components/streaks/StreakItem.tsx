import type z from "zod";
import moment from "moment";
import { View, Text } from "react-native";
import type { streakSelectSchema } from "@motus/server";
import { CheckCircleIcon } from "phosphor-react-native";

import { Colors } from "../../constants";

type StreakItemProps = {
  streak: z.infer<typeof streakSelectSchema>;
};

export function StreakItem({ streak }: StreakItemProps) {
  return (
    <View
      className="flex-row items-center gap-x-2 p-3 rounded-lg"
      style={{ backgroundColor: Colors.background[1] }}
    >
      <CheckCircleIcon
        weight="fill"
        size={28}
        color={streak.completed ? Colors.amber[0] : "white"}
      />
      <View className="flex-1 flex-row items-center gap-x-2">
        <Text className="text-white font-poppins-medium">{streak.steps}</Text>
        <Text
          className="font-poppins"
          style={{ color: Colors.subtitleColor }}
        >
          steps
        </Text>
      </View>
      <View>
        <Text
          className="font-poppins"
          style={{ color: Colors.subtitleColor }}
        >
          {moment(streak.createdAt).format("MMM D")}
        </Text>
      </View>
    </View>
  );
}
