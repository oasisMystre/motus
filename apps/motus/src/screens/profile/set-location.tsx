import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../../constants";
import Input from "../../components/Input";
import useDimensions from "../../hooks/useDimensions";
import { CircularBackButton } from "../../components/Header";

type SetLocationScreenProps = {
  goBack: () => void;
};

export function SetLocationScreen({ goBack }: SetLocationScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { width } = useDimensions("window");

  return (
    <View
      className="flex-1 px-6"
      style={{ width, marginBottom: bottom }}
    >
      <ScrollView
        contentContainerClassName="flex-1 gap-y-8 pt-8"
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text className="text-2xl text-white font-poppins-semibold">
            Choose a username
          </Text>
          <Text
            className="font-poppins"
            style={{
              color: Colors.grey,
            }}
          >
            Which nickname do you want
          </Text>
        </View>
        <View>
          <View className="gap-y-2">
            <Input
              label="Preferred nickname"
              labelAttrs={{
                style: {
                  color: Colors.grey,
                },
              }}
              inputAttrs={{
                value: "",
                placeholder: "johndoe",
                className: "py-4 px-2 rounded-md",
                style: { borderWidth: 1, borderColor: Colors.grey },
                focusStyle: { borderWidth: 1, borderColor: Colors.primary },
              }}
            />
          </View>
        </View>
      </ScrollView>
      <View className="flex-row items-center gap-x-8">
        <CircularBackButton
          canGoBack
          navigation={{ goBack }}
        />
        <Pressable
          className="flex-1 items-center justify-center bg-primary p-4 rounded-md"
          onPress={() => router.push("/(auth)/profile/set-username")}
        >
          <Text className="text-white font-poppins">Next</Text>
        </Pressable>
      </View>
    </View>
  );
}
