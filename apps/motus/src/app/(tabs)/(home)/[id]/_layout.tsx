import { Stack, Link } from "expo-router";
import { GearIcon } from "phosphor-react-native";

import { BackButton } from "../../../../components/Header";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={({ navigation }) => ({
        title: "Profile",
        headerLeft: (props) => (
          <BackButton
            {...props}
            navigation={navigation}
          />
        ),
        headerRight: () => (
          <Link href="/(tabs)/(more)">
            <GearIcon color="white" />
          </Link>
        ),
        headerShadowVisible: false,
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "transparent" },
      })}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
