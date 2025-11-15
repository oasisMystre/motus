import { Stack } from "expo-router";

import { useFirebase } from "../../../providers";
import { useReward } from "../../../hooks/useReward";
import { BackButton } from "../../../components/Header";
import { FeedHeader } from "../../../components/feeds/FeedHeader";

export default function HomeLayout() {
  const { user } = useFirebase();
  const { points } = useReward();

  return (
    <Stack
      screenOptions={({ navigation }) => ({
        headerLeft: (props) => (
          <BackButton
            {...props}
            navigation={navigation}
          />
        ),
        headerShadowVisible: false,
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "transparent" },
      })}
    >
      <Stack.Screen
        name="index"
        options={{
          header: () => (
            <FeedHeader
              points={points}
              user={user}
            />
          ),
          animation: "slide_from_bottom",
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="search"
        options={{ title: "Search", headerShown: true }}
      />
      <Stack.Screen
        name="notifications"
        options={{ title: "Notification", headerShown: true }}
      />
      <Stack.Screen
        name="(comments)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="[id]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
