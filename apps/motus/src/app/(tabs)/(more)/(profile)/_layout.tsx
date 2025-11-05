import { Stack } from "expo-router";
import { BackButton } from "../../../../components/Header";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={({ navigation }) => ({
        presentation: "fullScreenModal",
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: "Poppins_500Medium" },
        headerStyle: { backgroundColor: "transparent" },
        headerLeft: (props) => (
          <BackButton
            {...props}
            navigation={navigation}
          />
        ),
      })}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name="goals"
        options={{ title: "Goals" }}
      />
    </Stack>
  );
}
