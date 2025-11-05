import { Stack } from "expo-router";

import { BackButton } from "../../../../components/Header";

export default function LogMealLayout() {
  return (
    <Stack
      screenOptions={({ navigation }) => ({
        headerTitleAlign: "center",
        presentation: "fullScreenModal",
        animation: "slide_from_right",
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: "Poppins_500SemiBold",
        },
        headerLeft: () => <BackButton navigation={navigation} />,
        headerStyle: { backgroundColor: "transparent" },
      })}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Meal" }}
      />
      <Stack.Screen
        name="(add-meal)"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
