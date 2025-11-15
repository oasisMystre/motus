import { useQuery } from "@tanstack/react-query";
import { Text, View, FlatList } from "react-native";

import { useFirebase } from "../../../providers";
import { useTRPC } from "../../../providers/TRPCProvider";
import { useSensor } from "../../../providers/SensorProvider";
import { StreakItem } from "../../../components/streaks/StreakItem";
import { StreakInfo } from "../../../components/streaks/StreakInfo";
import { StreakProgress } from "../../../components/streaks/StreakProgress";

export default function StreaksScreen() {
  const trpc = useTRPC();
  const { user } = useFirebase();
  const { data: streaks = [] } = useQuery(trpc.streak.list.queryOptions());
  const { data: longestStreak } = useQuery(
    trpc.streak.aggregate.queryOptions(),
  );
  const { currentSteps } = useSensor();

  return (
    <FlatList
      data={streaks}
      style={{ paddingTop: 32 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponentStyle={{ rowGap: 32, marginBottom: 16 }}
      ListHeaderComponent={() => (
        <>
          <StreakProgress
            goalSteps={user.profile.steps}
            currentSteps={currentSteps}
          />
          <View className="gap-y-4">
            <Text className="text-lg text-white font-poppins-bold">
              Step History
            </Text>
            <StreakInfo value={longestStreak ? longestStreak : 0} />
          </View>
        </>
      )}
      contentContainerStyle={{ rowGap: 4 }}
      renderItem={({ item }) => <StreakItem streak={item} />}
    />
  );
}
