import { Stack } from "expo-router";

import { BackButton } from "../../../components/Header";

export default function LogLayout() {
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
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(log-meal)"
        options={{ title: "Meal Log", headerShown: false }}
      />

      <Stack.Screen
        name="(create-goal)"
        options={{ title: "Goals", presentation: "fullScreenModal" }}
      />
      <Stack.Screen
        name="(create-workout)"
        options={{
          headerShown: false,
          sheetElevation: 0,
          title: "Create Workout",
          presentation: "fullScreenModal",
        }}
      />
    </Stack>
  );
}
