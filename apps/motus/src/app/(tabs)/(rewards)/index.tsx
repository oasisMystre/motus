import { useQuery } from "@tanstack/react-query";
import { Pressable, View, Text, FlatList } from "react-native";

import { useReward } from "../../../hooks/useReward";
import { useTRPC } from "../../../providers/TRPCProvider";
import {
  RewardRecent,
  RewardMultiplier,
  RewardPoints,
  RewardItem,
} from "../../../components/rewards";

export default function RewardsScreen() {
  const trpc = useTRPC();
  const { points, newUserReward } = useReward();
  const { data: rewards = [] } = useQuery(trpc.reward.list.queryOptions());

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
