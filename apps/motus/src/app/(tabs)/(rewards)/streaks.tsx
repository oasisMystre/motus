import assert from "assert";
import { Text, View, FlatList } from "react-native";

import { useAppSelector } from "../../../store";
import { streakSelectors } from "../../../store/streak";
import { StreakItem } from "../../../components/streaks/StreakItem";
import { StreakInfo } from "../../../components/streaks/StreakInfo";
import { StreakProgress } from "../../../components/streaks/StreakProgress";

export default function StreaksScreen() {
  const { user } = useAppSelector((state) => state.auth);
  assert(user && user.type === "firebase" && user.profile);

  const { currentSteps, longestStreak, ...streakState } = useAppSelector(
    (state) => state.streak,
  );
  const streaks = streakSelectors.selectAll(streakState);

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
