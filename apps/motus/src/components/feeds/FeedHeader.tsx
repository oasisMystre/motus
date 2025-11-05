import clsx from "clsx";
import type z from "zod";
import Color from "color";
import type React from "react";
import { router, Link } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { userSelectSchema } from "@motus/server";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Avatar from "../Avatar";
import { Colors } from "../../constants";

type FeedHeaderProps = {
  points: number;
  user: z.infer<typeof userSelectSchema>;
} & React.ComponentProps<typeof View>;

export function FeedHeader({ user, points, ...props }: FeedHeaderProps) {
  const { top } = useSafeAreaInsets();

  return (
    <View
      {...props}
      className={clsx("flex-row items-center px-6", props.className)}
      style={{ marginTop: top }}
    >
      <View className="flex-1 flex-row items-center gap-x-4">
        <Pressable onPress={() => router.push(`/(home)/${user.id}`)}>
          <Avatar
            url={user.profile.avatar}
            style={{ width: 48, height: 48 }}
          />
        </Pressable>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          locations={[0, 1]}
          colors={[
            Colors.listItemColor,
            Color(Colors.primary).alpha(0.5).hexa(),
          ]}
          style={{ borderRadius: 100, paddingRight: 2, paddingVertical: 4 }}
        >
          <Pressable
            className="flex-row items-center justify-center"
            onPress={() => router.push("/(rewards)")}
          >
            <Text className="flx-1 text-white font-poppins-medium pl-2">
              {points} MOTUS
            </Text>
            <MaterialIcons
              size={24}
              name="chevron-right"
              color={Colors.background[7]}
            />
          </Pressable>
        </LinearGradient>
      </View>
      <View className="flex-row gap-x-4">
        <Link href="/(home)/search">
          <MaterialIcons
            size={24}
            name="search"
            color="white"
          />
        </Link>
        <Link href="/(home)/notifications">
          <MaterialIcons
            name="notifications-none"
            color="white"
            size={24}
          />
        </Link>
      </View>
    </View>
  );
}
