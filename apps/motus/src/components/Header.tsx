import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { type GestureResponderEvent, Pressable } from "react-native";

import { Colors } from "../constants";

export function BackButton<
  T extends { goBack: (ev?: GestureResponderEvent) => void },
>({
  navigation,
  canGoBack,
  icon,
}: {
  navigation: T;
  canGoBack?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      className="flex items-center justify-center"
      onPress={(event) => {
        if (canGoBack) navigation.goBack(event);
        else router.back();
      }}
    >
      {icon ? (
        icon
      ) : (
        <Feather
          name="arrow-left"
          size={24}
          color="white"
        />
      )}
    </Pressable>
  );
}

export function CircularBackButton<T extends { goBack: () => void }>({
  navigation,
  canGoBack,
}: {
  navigation: T;
  canGoBack?: boolean;
}) {
  return (
    canGoBack && (
      <Pressable
        className="flex items-center justify-center size-12 bg-white rounded-full"
        onPress={navigation.goBack}
      >
        <Feather
          name="arrow-left"
          size={24}
          color={Colors.primary}
        />
      </Pressable>
    )
  );
}
