import { useEffect } from "react";
import { router, Stack } from "expo-router";

import { useFirebase } from "../providers";

export default function App() {
  const { user, anonymousUser } = useFirebase();

  useEffect(() => {
    if (user) {
      if (
        user.profile.gender &&
        user.profile.age &&
        user.profile.weight &&
        user.profile.height
      )
        router.replace("/(tabs)");
      else router.replace("/(auth)/profile");
    } else {
      if (anonymousUser) router.replace("/(auth)");
      else router.replace("/onboarding");
    }
  }, [user, anonymousUser]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen name="onboarding" />
      <Stack.Protected guard={Boolean(user?.profile)}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(anonymousUser)}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
