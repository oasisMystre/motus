import type z from "zod";
import Color from "color";
import type React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import type { userSelectSchema } from "@motus/server";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import Avatar from "../Avatar";
import { Colors } from "../../constants";
import { router } from "expo-router";

type FeedHeaderProps = {
  points: number;
  user: z.infer<typeof userSelectSchema>;
} & React.ComponentProps<typeof View>;

export function FeedHeader({ user, points, ...props }: FeedHeaderProps) {
  return (
    user && (
      <View
        className="flex-row items-center px-6"
        {...props}
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
          <Pressable onPress={() => router.push("/(home)/search")}>
            <MaterialIcons
              size={24}
              name="search"
              color="white"
            />
          </Pressable>
          <Pressable>
            <MaterialIcons
              name="notifications-none"
              color="white"
              size={24}
            />
          </Pressable>
        </View>
      </View>
    )
  );
}
