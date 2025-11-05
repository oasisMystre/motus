import { format } from "util";

import { Pressable, Text, View, FlatList } from "react-native";
import { type Link, router, useLocalSearchParams } from "expo-router";

import { Colors } from "../../../../constants";
import HotMeal from "../../../../assets/hot-meal";
import DumbBell from "../../../../assets/dumb-bell";
import { useUser } from "../../../../hooks/useUser";

export default function ItemsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useUser(id);

  const infos: {
    icon: React.ElementType;
    value: string;
    path: React.ComponentProps<typeof Link>["href"];
  }[] = [
    {
      icon: HotMeal,
      value: format("%d Meals", user?.mealsCount),
      path: "/(log)/(log-meal)/",
    },
    {
      icon: DumbBell,
      value: format("%d Workouts", user?.workoutsCount),
      path: "/(log)/(create-workout)/",
    },
  ];
  return (
    <FlatList
      data={infos}
      className="pt-8 px-6"
      contentContainerClassName="gap-y-2"
      renderItem={({ item: info }) => (
        <View
          className="flex-row items-center gap-x-2 px-4 py-2 rounded-md"
          style={{
            backgroundColor: Colors.background[10],
          }}
        >
          <info.icon
            width={48}
            height={48}
          />
          <Text className="flex-1 text-white font-poppins">{info.value}</Text>
          <Pressable onPress={() => router.push(info.path)}>
            <Text className="text-primary font-poppins">Create</Text>
          </Pressable>
        </View>
      )}
    />
  );
}
