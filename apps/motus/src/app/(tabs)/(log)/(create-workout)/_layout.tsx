import { Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { BackButton } from "../../../../components/Header";

export default function CreateWorkoutLayout() {
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
        headerLeft: () => <BackButton navigation={navigation} />,
        headerStyle: {
          backgroundColor: "transparent",
        },
      })}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="(log-workout)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="start-routine"
        options={({ navigation }) => ({
          title: "Start Workout",
          headerLeft: (props) => (
            <BackButton
              {...props}
              navigation={navigation}
              icon={
                <Feather
                  name="chevron-down"
                  color="white"
                  size={24}
                />
              }
            />
          ),
        })}
      />
      <Stack.Screen
        name="(create-routine)"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
