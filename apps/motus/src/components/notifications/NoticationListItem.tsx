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

export default function NotificationListItem({
  item,
}: NotificationListItemProps) {
  const { t } = useTranslation();
  const icon = useMemo(() => {
    if (
      item.action?.type &&
      ["post_new_like", "post_new_comment_like"].includes(item.action?.type)
    )
      return (
        <HeartIcon
          size={32}
          color={Colors.red[0]}
        />
      );
    if (item.action?.type && ["new_follower", "new_mention"])
      return (
        <MaterialIcons
          name="person"
          size={32}
          fill={Colors.primary}
        />
      );
    if (item.action?.type && ["new_post", "new_mention"])
      return (
        <MaterialIcons
          name="announcement"
          size={32}
          fill={Colors.primary}
        />
      );
  }, [item]);

  return (
    <View className="flex flex-row space-x-4">
      {icon}
      <View className="flex-1 flex flex-col space-y-4">
        {item.icon && (
          <Image
            source={{ uri: item.icon }}
            alt="icon"
            style={{
              width: 24,
              height: 24,
              borderRadius: 100,
            }}
          />
        )}
        {item.title?.text && (
          <Text className="font-base font-poppins-medium">
            {item.title.external
              ? /** @ts-ignore */
                t(item.title.text, item.title.extra)
              : item.title.text}
          </Text>
        )}
        {item.subtitle?.text && (
          <Text
            className="font-poppins font-sm"
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
  );
}
