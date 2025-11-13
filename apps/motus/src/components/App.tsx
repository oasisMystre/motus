import { useEffect } from "react";
import { router, Stack } from "expo-router";

import { useAppSelector } from "../store";

export default function App() {
  const { user } = useAppSelector((state) => state.auth);
  useEffect(() => {
    if (user) {
      if (user.type === "anonymous")
        if (user.uid) router.replace("/(auth)");
        else router.replace("/onboarding");
      else if (user.type === "firebase") {
        if (
          user.profile.gender &&
          user.profile.age &&
          user.profile.weight &&
          user.profile.height
        )
          router.replace("/(tabs)");
        else router.replace("/(auth)/profile");
      }
    } else router.replace("/onboarding");
  }, [user?.type, user?.uid]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        headerTitleAlign: "center",
      }}
    >
      <Stack.Protected
        guard={Boolean(user?.type === "firebase" && user.profile)}
      >
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}
