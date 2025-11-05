import assert from "assert";
import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  RefreshControl,
  View,
  FlatList,
} from "react-native";

import { Colors } from "../../../constants";
import { FeedPost } from "../../../components/feeds";
import { useTRPC } from "../../../providers/TRPCProvider";
import { useAppDispatch, useAppSelector } from "../../../store";
import { postActions, postSelector } from "../../../store/post";

export default function HomeScreen() {
  const trpc = useTRPC();
  const { top } = useSafeAreaInsets();

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const postState = useAppSelector((state) => state.post);
  const posts = postSelector.selectAll(postState);

  assert(user && user.type === "firebase");

  const { refetch, data, isRefetching } = useQuery(
    trpc.post.list.queryOptions(),
  );

  useEffect(() => {
    if (data) dispatch(postActions.setPosts(data));
  }, [data]);

  return (
    <FlatList
      collapsable
      data={posts}
      style={{ marginTop: top, flex: 1 }}
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
      ListEmptyComponent={() => (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="white" />
        </View>
      )}
      renderItem={({ item }) => (
        <FeedPost
          user={user}
          post={item}
        />
      )}
    />
  );
}
