import assert from "assert";
import { Stack } from "expo-router";

import { useAppSelector } from "../../../store";
import { BackButton } from "../../../components/Header";
import { FeedHeader } from "../../../components/feeds/FeedHeader";

export default function HomeLayout() {
  const { user } = useAppSelector((state) => state.auth);
  const { points } = useAppSelector((state) => state.reward);

  assert(user && user.type === "firebase");

  return (
    <Stack
      screenOptions={({ navigation }) => ({
        headerLeft: (props) => (
          <BackButton
            {...props}
            navigation={navigation}
          />
        ),
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
