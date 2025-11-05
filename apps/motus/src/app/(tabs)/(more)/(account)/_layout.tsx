import { Stack } from "expo-router";
import { BackButton } from "../../../../components/Header";
import SnackbarProvider from "../../../../providers/SnackbarProvider";

export default function AccountLayout() {
  return (
    <SnackbarProvider>
      <Stack
        screenOptions={({ navigation }) => ({
          headerTitleAlign: "center",
          headerShadowVisible: false,
          headerTitleStyle: { fontFamily: "Poppins_500Medium" },
          headerStyle: { backgroundColor: "transparent" },
          headerLeft: (props) => (
            <BackButton
              navigation={navigation}
              {...props}
            />
          ),
        })}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Account Settings" }}
        />
        <Stack.Screen
          name="set-email"
          options={{ title: "Change Email" }}
        />
        <Stack.Screen
          name="set-username"
          options={{ title: "Change Username" }}
        />
        <Stack.Screen
          name="set-password"
          options={{ title: "Change Password" }}
        />
      </Stack>
    </SnackbarProvider>
  );
}
