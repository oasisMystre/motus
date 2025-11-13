import { Stack } from "expo-router";
import { BackButton } from "../../../../../components/Header";

export default function LogWorkoutLayout() {
  return (
    <Stack
      screenOptions={({ navigation }) => ({
        title: "Workout",
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
      />
      <Stack.Screen name="log-workout" options={{title: "Create Workout"}} />
    </Stack>
  );
}
