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
          onPress={() => {
            if (content.type === "add-routine")
              router.push({
                pathname: "/(tabs)/(log)/(create-workout)/(create-routine)",
                params: { id: content.data.id, action: "edit" },
              });
            else if (content.type === "log-routine")
              router.push({
                pathname: "/(tabs)/(log)/(create-workout)/start-routine",
                params: { id: content.data.id, action: "edit" },
              });
            else if (content.type === "add-meal")
              router.push({
                pathname:
                  "/(tabs)/(log)/(log-meal)/(add-meal)/(add-food)/(create-food)",
                params: { id: content.data.id, action: "edit" },
              });
            else if (content.type === "log-meal")
              router.push({
                pathname: "/(tabs)/(log)/(log-meal)",
                params: { id: content.data.id, action: "edit" },
              });
            else if (content.type === "log-workout")
              router.push({
                pathname:
                  "/(tabs)/(log)/(create-workout)/(log-workout)/log-workout",
                params: { id: content.data.id, action: "edit" },
              });
          }}
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
