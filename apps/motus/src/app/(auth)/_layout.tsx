import { Stack } from "expo-router";

import { Colors } from "../../constants";
import { useFirebase } from "../../providers";
import { BackButton } from "../../components/Header";

export default function AuthLayout() {
  const { user } = useFirebase();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium",
          },
        }}
      />
      <Stack.Screen
        name="(signup)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="login"
        options={({ navigation }) => ({
          headerShown: true,
          title: "Login",
          headerLeft: (props) => (
            <BackButton
              {...props}
              navigation={navigation}
            />
          ),
          headerStyle: { backgroundColor: Colors.navColor },
        })}
      />
      <Stack.Protected guard={Boolean(user)}>
        <Stack.Screen
          name="profile/index"
          options={{ headerShown: false }}
        />
      </Stack.Protected>
    </Stack>
  );
}
