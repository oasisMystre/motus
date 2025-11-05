import React from "react";
import { Stack } from "expo-router";

import { Colors } from "../../../constants";
import { BackButton } from "../../../components/Header";

export default function SignupLayout() {
  return (
    <Stack
      screenOptions={({ navigation }) => ({
        title: "Signup",
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontFamily: "Poppins_500Medium",
        },
        headerLeft: (props) => (
          <BackButton
            {...props}
            navigation={navigation}
          />
        ),
        headerStyle: { backgroundColor: Colors.navColor },
      })}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="password" />
    </Stack>
  );
}
