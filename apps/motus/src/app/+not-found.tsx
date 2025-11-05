import { Link, Stack } from "expo-router";
import { View } from "react-native";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops! Not found" }} />
      <View className="flex-1 bg-gray-800 justify-center items-center">
        <Link
          href={"/"}
          className="text-[20px] underline text-white"
        >
          Go back to Home Screen!
        </Link>
      </View>
    </>
  );
}
