import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, View } from "react-native";

import { Colors } from "../../../constants";
import { useTRPC } from "../../../providers/TRPCProvider";
import { NotificationListItem } from "../../../components/notifications";

export default function NotificationPage() {
  const trpc = useTRPC();
  const { data: notifications } = useQuery(
    trpc.nottication.list.queryOptions(),
  );

  return notifications && notifications?.length > 0 ? (
    <FlashList
      data={notifications}
      ItemSeparatorComponent={() => (
        <View style={{ height: 2, backgroundColor: Colors.dividerColor }} />
      )}
      renderItem={({ item }) => <NotificationListItem item={item} />}
    />
  ) : (
    <View className="flex-1 flex items-center justify-center">
      <ActivityIndicator size={32} />
    </View>
  );
}
