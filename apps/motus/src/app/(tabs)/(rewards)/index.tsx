import { Pressable, View, Text, FlatList } from "react-native";

import {
  RewardRecent,
  RewardMultiplier,
  RewardPoints,
  RewardItem,
} from "../../../components/rewards";
import { useAppSelector } from "../../../store";
import { rewardSelectors } from "../../../store/reward";

export default function RewardsScreen() {
  const { points, newUserReward, ...rewardState } = useAppSelector(
    (state) => state.reward,
  );

  const rewards = rewardSelectors.selectAll(rewardState);

  return (
    <FlatList
      style={{ paddingTop: 32 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponentStyle={{ rowGap: 32, marginBottom: 8 }}
      ListHeaderComponent={() => (
        <>
          <View className="gap-y-4">
            <RewardPoints points={points} />
            <RewardRecent reward={newUserReward} />
          </View>
          <RewardMultiplier />
        </>
      )}
      data={rewards}
      contentContainerStyle={{ rowGap: 8 }}
      renderItem={({ item }) => <RewardItem reward={item} />}
      ListFooterComponentStyle={{
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 16,
      }}
      ListFooterComponent={() => (
        <Pressable className="p-2 hidden">
          <Text className="text-primary">See All Transactions</Text>
        </Pressable>
      )}
    />
  );
}
