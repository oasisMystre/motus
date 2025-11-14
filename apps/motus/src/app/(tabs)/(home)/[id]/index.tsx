import Color from "color";

import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { View, Text, ActivityIndicator, FlatList } from "react-native";

import { Colors } from "../../../../constants";
import { useUser } from "../../../../hooks/useUser";
import { FeedPost } from "../../../../components/feeds";
import { useTRPC } from "../../../../providers/TRPCProvider";

export default function ProfileScreen() {
  const trpc = useTRPC();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useUser(id);

  const { data } = useQuery(
    trpc.post.list.queryOptions({ filter: { user: id } }),
  );

  const infos = [
    {
      value: user?.workoutsCount,
      title: "Workouts",
    },
    {
      value: user?.followersCount,
      title: "Followers",
    },
    {
      value: user?.followingCount,
      title: "Following",
    },
    {
      value: user?.routinesCount,
      title: "Routines",
    },
  ];

  return (
    user && (
      <FlatList
        data={data}
        style={{ paddingHorizontal: 16, paddingTop: 32 }}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={() => (
          <ActivityIndicator
            color="white"
            className="flex-1"
          />
        )}
        ListHeaderComponent={() => (
          <View className="gap-y-8 mb-2">
            <View className="self-center flex-row gap-x-1">
              {infos.map((info, index) => (
                <View
                  key={index}
                  className="items-center justify-center rounded-md p-2"
                  style={{
                    backgroundColor: Color(Colors.primary).alpha(0.25).hexa(),
                  }}
                >
                  <Text className="text-white font-poppins-medium">
                    {info.value}
                  </Text>
                  <Text
                    className="font-poppins"
                    style={{ color: Colors.grey }}
                  >
                    {info.title}
                  </Text>
                </View>
              ))}
            </View>
            <Text
              className="font-poppins"
              style={{ color: Colors.grey }}
            >
              Recent Workouts
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <FeedPost
            post={item}
            user={user}
          />
        )}
      />
    )
  );
}
