import { Text } from "react-native";
import { Link, Stack } from "expo-router";

import { BackButton } from "../../../../../../components/Header";

export default function AddExerciseLayout() {
  return (
    <Stack
      screenOptions={({ navigation }) => ({
        title: "Add Exercise",
        headerTitleAlign: "center",
        presentation: "fullScreenModal",
        headerTitleStyle: { fontFamily: "Poppins_500Medium" },
        headerShadowVisible: false,
        headerLeft: (props) => (
          <BackButton
            {...props}
            navigation={navigation}
          />
        ),
        headerRight: () => (
          <Link href="/create-exercise">
            <Text className="text-primary">Create</Text>
          </Link>
        ),
        headerStyle: { backgroundColor: "transparent" },
      })}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="create-exercise" />
    </Stack>
  );
}
