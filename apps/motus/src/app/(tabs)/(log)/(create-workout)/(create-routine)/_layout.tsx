import { Stack } from "expo-router";
import { BackButton } from "../../../../../components/Header";

export default function CreateWorkoutLayout() {
  return (
    <Stack
      screenOptions={({ navigation }) => ({
        title: "Create Routine",
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
      <Stack.Screen name="index" />
      <Stack.Screen
        name="(add-exercise)"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
