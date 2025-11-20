import type z from "zod";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import type { userSelectSchema } from "@motus/server";
import { useMutation } from "@tanstack/react-query";

import Avatar from "../Avatar";
import Button from "../Button";
import { Colors } from "../../constants";
import { useTRPC } from "../../providers/TRPCProvider";

export type User = z.infer<typeof userSelectSchema> & {
  isFollowing: boolean | null;
};

type ListItemProps = {
  item: User;
  updateUser: (user: User) => void;
};

export function ListItem({ item, updateUser }: ListItemProps) {
  const trpc = useTRPC();

  const { mutateAsync, isPending } = useMutation(
    trpc.follow.create.mutationOptions({
      onSuccess(data) {
        updateUser({
          ...item,
          isFollowing: data.isFollowing,
        });
      },
    }),
  );

  return (
    <View className="flex-row items-center gap-x-2 py-2">
      <Link href={`/(tabs)/(home)/${item.id}`}>
        <Avatar
          url={item.profile.avatar}
          style={{ width: 40, height: 40 }}
        />
      </Link>
      <View className="flex-1">
        <Text className="font-poppins-medium text-white">{item.name}</Text>
        <Text
          className="text-sm font-poppins"
          style={{ color: Colors.grey }}
        >
          @{item.username}
        </Text>
      </View>
      <Button
        disabled={isPending}
        submitting={isPending}
        text={item.isFollowing ? "Following" : "Follow"}
        style={{
          paddingVertical: 8,
          backgroundColor: item.isFollowing ? Colors.grey : Colors.primary,
        }}
        onPress={() =>
          mutateAsync({
            following: item.id,
            isFollowing: !item.isFollowing,
          })
        }
      />
    </View>
  );
}
