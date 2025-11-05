import { Stack } from "expo-router";
import { View } from "react-native";
import { BackButton } from "../../../components/Header";

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={({ navigation }) => ({
        headerShown: false,
        headerLeft: (props) => (
          <BackButton
            {...props}
            navigation={navigation}
          />
        ),
        headerStyle: { backgroundColor: "transparent" },
      })}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="search"
        options={{ title: "Search", headerShown: true }}
      />
      <Stack.Screen name="(comments)" />
      <Stack.Screen
        name="[id]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
