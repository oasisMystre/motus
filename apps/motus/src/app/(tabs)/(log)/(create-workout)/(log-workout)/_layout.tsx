import { Stack } from "expo-router";
import { BackButton } from "../../../../../components/Header";

export default function LogWorkoutLayout() {
  return (
    <Stack
      screenOptions={({ navigation }) => ({
        title: "Routines",
        headerTitleAlign: "center",
        presentation: "fullScreenModal",
        animation: "slide_from_right",
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: "Poppins_500Medium",
        },
        headerLeft: (props) => (
          <BackButton
            {...props}
            navigation={navigation}
          />
        ),
        headerStyle: {
          backgroundColor: "transparent",
        },
      })}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Workout" }}
      />
      <Stack.Screen name="log-workout" />
    </Stack>
  );
}
