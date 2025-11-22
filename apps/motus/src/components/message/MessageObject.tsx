import Color from "color";
import assert from "assert";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { ArrowUpRightIcon } from "phosphor-react-native";

import type { IMessage } from "../../store/message";
import { Colors } from "../../constants";

export function MessageObject({ message: { content } }: { message: IMessage }) {
  const router = useRouter();
  assert(!["text", "image"].includes(content.type) && "summary" in content);

  return (
    <View>
      <View
        style={{
          padding: 8,
          minHeight: 96,
          backgroundColor: Color(Colors.background[8]).darken(0.5).hexa(),
        }}
      >
        <Pressable
          style={{
            marginLeft: "auto",
            borderRadius: 100,
            padding: 6,
            backgroundColor: Colors.background[8],
          }}
          onPress={() => {}}
        >
          <ArrowUpRightIcon
            size={18}
            color="white"
          />
        </Pressable>
      </View>
      <Text
        selectable
        style={{
          paddingVertical: 8,
          paddingHorizontal: 8,
        }}
        className="text-white font-poppins"
      >
        {content.summary}
      </Text>
    </View>
  );
}
