import { Stack } from "expo-router";
import { BackButton } from "../../../components/Header";

export default function MoreLayout() {
  return (
    <Stack
      screenOptions={({ navigation }) => ({
        headerShown: false,
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: "Poppins_500Medium" },
        headerStyle: { backgroundColor: "transparent" },
        presentation: "modal",
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
        options={{
          title: "Settings",
          headerShown: true,
          headerLeft: undefined,
        }}
      />
      <Stack.Screen
        name="(profile)"
        options={{
          animation: "slide_from_right",
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="(account)"
        options={{
          animation: "slide_from_right",
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="notification"
        options={{
          headerShown: true,
          headerTitle: "Notification Settings",
          animation: "slide_from_right",
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="subscription"
        options={{
          headerShown: true,
          headerTitle: "Subscription",
          animation: "slide_from_bottom",
          presentation: "fullScreenModal",
        }}
      />
    </Stack>
  );
}
