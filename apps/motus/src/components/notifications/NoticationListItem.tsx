import type z from "zod";
import moment from "moment";
import { useMemo } from "react";
import { Image } from "expo-image";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import { HeartIcon } from "phosphor-react-native";
import type { notificationSelectSchema } from "@motus/server";

import { Colors } from "../../constants";

type NotificationListItemProps = {
  item: z.infer<typeof notificationSelectSchema>;
};

export function NotificationListItem({ item }: NotificationListItemProps) {
  const { t } = useTranslation();
  const icon = useMemo(() => {
    if (
      item.action?.type &&
      ["post_new_like", "post_new_comment_like"].includes(item.action.type)
    )
      return (
        <HeartIcon
          size={32}
          color={Colors.red[0]}
        />
      );
    if (
      item.action?.type &&
      ["new_follower", "new_mention"].includes(item.action.type)
    )
      return (
        <MaterialIcons
          name="person"
          size={32}
          color={Colors.primary}
        />
      );
    if (
      item.action?.type &&
      ["new_post", "post_new_comment", "new_mention"].includes(item.action.type)
    )
      return (
        <MaterialIcons
          name="announcement"
          size={32}
          color={Colors.purple}
        />
      );
  }, [item]);

  return (
    <View className="flex flex-row gap-x-4 p-2">
      {icon}
      <View className="flex-1 flex flex-row">
        <View className="flex-1 flex flex-col">
          {item.icon && (
            <Image
              source={{ uri: item.icon }}
              alt="icon"
              style={{
                width: 32,
                height: 32,
                borderRadius: 100,
              }}
            />
          )}
          {item.title?.text && (
            <Text className="text-white font-base font-poppins-medium">
              {item.title.external
                ? /** @ts-ignore */
                  t(item.title.text, item.title.extra)
                : item.title.text}
            </Text>
          )}
          {item.subtitle?.text && (
            <Text
              className="text-white font-poppins font-sm"
              style={{ color: Colors.subtitleColor }}
            >
              {item.subtitle.external
                ? /** @ts-ignore */
                  t(item.subtitle.text, item.subtitle.extra)
                : item.subtitle.text}
            </Text>
          )}
        </View>
        <Text
          className="font-poppins font-sm"
          style={{ color: Colors.subtitleColor }}
        >
          {moment(item.createdAt).format("MMM D")}
        </Text>
      </View>
    </View>
  );
}
