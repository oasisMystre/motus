import type z from "zod";
import Color from "color";
import { useQuery } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import type { userExtendSelectSchema } from "@motus/server";
import { View, Text, ActivityIndicator, FlatList } from "react-native";

import { Colors } from "../../constants";
import { FeedPost } from "../../components/feeds";
import useDimensions from "../../hooks/useDimensions";
import { useTRPC } from "../../providers/TRPCProvider";

type InfoScreenProps = {
  user: z.infer<typeof userExtendSelectSchema>;
};

export default function InfoScreen({ user }: InfoScreenProps) {
  const trpc = useTRPC();
  const { width } = useDimensions("window");
  const { data, isFetching } = useQuery(
    trpc.post.list.queryOptions({ filter: { user: user.id } }),
  );

  const infos = [
    {
      value: user.workoutsCount,
      title: "Workouts",
    },
    {
      value: user.followersCount,
      title: "Followers",
    },
    {
      value: user.followingCount,
      title: "Following",
    },
    {
      value: user.routinesCount,
      title: "Routines",
    },
  ];

  return (
    <FlatList
      data={data}
      style={{ flex: 1, paddingTop: 32, width }}
      contentContainerStyle={{ flexGrow: 1 }}
      ListEmptyComponent={() => {
        if (isFetching)
          return (
            <ActivityIndicator
              color="white"
              className="flex-1"
            />
          );

        return (
          <View className="flex-1 items-center justify-center">
            <MaterialIcons
              name="view-list"
              size={32}
              color="white"
            />
            <Text className="text-lg text-white font-poppins-medium">
              No post found
            </Text>
          </View>
        );
      }}
      ListHeaderComponent={() => (
        <View className="gap-y-8 mb-4">
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
            style={{ color: Colors.grey, marginHorizontal: 16 }}
          >
            Recent Posts
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
  );
}
