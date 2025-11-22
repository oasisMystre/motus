import type z from "zod";
import { format } from "util";
import { Link } from "expo-router";
import { Text, View, FlatList } from "react-native";
import type { userExtendSelectSchema } from "@motus/server";

import { Colors } from "../../constants";
import HotMeal from "../../assets/hot-meal";
import DumbBell from "../../assets/dumb-bell";
import useDimensions from "../../hooks/useDimensions";

type ItemsScreenProps = {
  user: z.infer<typeof userExtendSelectSchema>;
};

export default function ItemsScreen({ user }: ItemsScreenProps) {
  const { width } = useDimensions("window");

  const infos: {
    icon: React.ElementType;
    value: string;
    path: React.ComponentProps<typeof Link>["href"];
  }[] = [
    {
      icon: HotMeal,
      value: format("%d Meals", user.mealsCount),
      path: "/(tabs)/(log)/(log-meal)",
    },
    {
      icon: DumbBell,
      value: format("%d Workouts", user.workoutsCount),
      path: "/(tabs)/(log)/(create-workout)",
    },
  ];
  return (
    <FlatList
      data={infos}
      style={{ flex: 1, width }}
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
          <Link href={info.path}>
            <Text className="text-primary font-poppins">Create</Text>
          </Link>
        </View>
      )}
    />
  );
}
