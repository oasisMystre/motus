import type z from "zod";
import moment from "moment";
import { Pressable, Text, View } from "react-native";
import type { commentSelectSchema } from "@motus/server";

import Avatar from "../Avatar";
import { Colors } from "../../constants";

type CommentItemProps = {
  showReply?: boolean;
  comment: z.infer<typeof commentSelectSchema>;
  replyAttrs?: React.ComponentProps<typeof Pressable>;
  avatarAttrs?: Omit<React.ComponentProps<typeof Avatar>, "url">;
};

export function CommentItem({
  comment,
  showReply,
  replyAttrs,
  avatarAttrs,
}: CommentItemProps) {
  return (
    <View className="flex-row gap-x-2">
      <Avatar
        url={comment.user.profile.avatar}
        style={[{ width: 40, height: 40 }, avatarAttrs?.style]}
        {...avatarAttrs}
      />
      <View className="gap-y-2">
        <View>
          <View className="flex-row items-center gap-x-2">
            <Text className="text-lg text-white font-poppins-medium">
              {comment.user.name}
            </Text>
            <Text
              className="text-sm font-poppins"
              style={{ color: Colors.text[2] }}
            >
              {moment(comment.createdAt).fromNow()}
            </Text>
          </View>
          <Comment text={comment.text} />
        </View>
        {showReply && (
          <Pressable {...replyAttrs}>
            <Text
              className="font-poppins"
              style={{ color: Colors.grey }}
            >
              Reply
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const Comment = ({ text }: { text: string }) => {
  const parts = text.split(/(@[a-zA-Z0-9._-]+)/g);

  return (
    <Text
      style={{
        color: Colors.text[2],
        flexShrink: 1,
        flexWrap: "wrap",
        fontFamily: "Poppins_400Regular",
      }}
    >
      {parts.map((part, index) =>
        /^@/.test(part) ? (
          <Text
            key={index}
            style={{
              color: Colors.primary,
              fontFamily: "Poppins_500Medium",
            }}
          >
            {part}
          </Text>
        ) : (
          <Text key={index}>{part}</Text>
        ),
      )}
    </Text>
  );
};
