import z from "zod";
import { Text, View } from "react-native";
import { useMutation } from "@tanstack/react-query";

import Avatar from "../Avatar";
import Button from "../Button";
import { Colors } from "../../constants";
import { useAppDispatch } from "../../store";
import { useTRPC } from "../../providers/TRPCProvider";
import { searchActions, type User } from "../../store/search";

type ListItemProps = {
  item: User;
};

export function ListItem({ item }: ListItemProps) {
  const trpc = useTRPC();
  const dispatch = useAppDispatch();

  const { mutateAsync, isPending } = useMutation(
    trpc.follow.create.mutationOptions({
      onSuccess(data) {
        dispatch(
          searchActions.updateUser({
            id: data.follower.id,
            changes: { isFollowing: data.isFollowing },
          }),
        );
      },
    }),
  );

  return (
    <View className="flex-row items-center gap-x-2 py-2">
      <Avatar
        url={item.profile.avatar}
        style={{ width: 40, height: 40 }}
      />
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
