import assert from "assert";
import { useQuery } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  RefreshControl,
  View,
  Text,
  FlatList,
} from "react-native";

import { Colors } from "../../../constants";
import { useAppSelector } from "../../../store";
import { FeedPost } from "../../../components/feeds";
import { useTRPC } from "../../../providers/TRPCProvider";

export default function HomeScreen() {
  const trpc = useTRPC();

  const { user } = useAppSelector((state) => state.auth);

  assert(user && user.type === "firebase");

  const {
    refetch,
    data = [],
    isRefetching,
    isFetching,
  } = useQuery(trpc.post.list.queryOptions());

  return (
    <FlatList
      collapsable
      data={data}
      style={{ paddingTop: 16, flex: 1 }}
      keyExtractor={(post) => post.id}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          onRefresh={refetch}
          refreshing={isRefetching}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
          progressBackgroundColor="white"
        />
      }
      contentContainerStyle={{ flexGrow: 1 }}
      ItemSeparatorComponent={() => <View style={{ height: 32 }} />}
      ListEmptyComponent={() => {
        return (
          <View className="flex-1 items-center justify-center">
            {isFetching ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialIcons
                  name="view-list"
                  size={32}
                  color="white"
                />
                <Text className="text-lg text-white font-poppins-medium">
                  No Post Found
                </Text>
                <Text className="text-white text-sm text-white/75 font-poppins">
                  You and your followers posts will be visible here.
                </Text>
              </>
            )}
          </View>
        );
      }}
      renderItem={({ item }) => (
        <FeedPost
          user={user}
          post={item}
        />
      )}
    />
  );
}
