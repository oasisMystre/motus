import { useQuery } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  View,
  FlatList,
  Text,
  RefreshControl,
} from "react-native";

import { Colors } from "../../../constants";
import { useTRPC } from "../../../providers/TRPCProvider";
import { NotificationListItem } from "../../../components/notifications";

export default function NotificationPage() {
  const trpc = useTRPC();
  const {
    data: notifications,
    isFetching,
    refetch,
    isRefetching,
  } = useQuery(trpc.notification.list.queryOptions());

  return (
    <FlatList
      data={notifications}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          onRefresh={refetch}
          refreshing={isRefetching}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
          progressBackgroundColor="white"
        />
      }
      ListEmptyComponent={() => {
        if (isFetching)
          return (
            <ActivityIndicator
              color="white"
              size={32}
            />
          );

        return (
          <View className="flex-1 flex flex-col gap-y-2 items-center justify-center">
            <MaterialIcons
              name="notifications-none"
              size={32}
              color="white"
            />
            <View className="flex flex-col items-center justify-center">
              <Text className="text-lg text-white font-poppins-medium">
                Empty Notifications
              </Text>
              <Text className="text-white text-sm text-white/75 font-poppins">
                Check here to view your notifications.
              </Text>
            </View>
          </View>
        );
      }}
      ItemSeparatorComponent={() => (
        <View style={{ height: 1, backgroundColor: Colors.dividerColor }} />
      )}
      renderItem={({ item }) => <NotificationListItem item={item} />}
    />
  );
}
