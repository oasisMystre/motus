import { Stack } from "expo-router";
import { BackButton } from "../../../../components/Header";

export default function CommentLayout() {
  return (
    <Stack
      screenOptions={({ navigation }) => ({
        headerTitleAlign: "center",
        presentation: "modal",
        animation: "slide_from_bottom",
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
        headerStyle: { backgroundColor: "transparent" },
      })}
    >
      <Stack.Screen
        name="[post]"
        options={{ title: "Comment", headerShown: true }}
      />
    </Stack>
  );
}
