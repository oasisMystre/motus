import { Text, View } from "react-native";
import { Link, Tabs, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../../../../../../constants";
import { BackButton } from "../../../../../../components/Header";
import SnackbarProvider from "../../../../../../providers/SnackbarProvider";
import SearchInput, {
  SearchProvider,
} from "../../../../../../components/SearchInput";

const tabs: {
  title: string;
  path: React.ComponentProps<typeof Link>["href"];
}[] = [
  { title: "All", path: "/(add-food)" },
  { title: "My Foods", path: "/(add-food)/foods" },
];

export default function AddFoodLayout() {
  const segments = useSegments();
  const { top } = useSafeAreaInsets();

  return (
    <SnackbarProvider>
      <SearchProvider>
        <Tabs
          screenOptions={({ navigation }) => ({
            title: "Add Food",
            tabBarStyle: { display: "none" },
            header: (props) => (
              <View
                className="px-6"
                style={{ marginTop: top }}
              >
                <View className="flex-row items-center">
                  <BackButton
                    canGoBack
                    navigation={navigation}
                  />
                  <Text className="flex-1 text-lg text-white text-center font-poppins-medium">
                    {typeof props.options?.headerTitle === "string"
                      ? props.options?.headerTitle
                      : "Add Food"}
                  </Text>
                </View>
                <View className="gap-y-6">
                  <SearchInput
                    inputAttrs={{ placeholder: "Search for a food" }}
                  />
                  <View className="flex-row gap-x-8">
                    {tabs.map((tab, index) => {
                      const active = segments
                        .join("/")
                        .endsWith(tab.path as string);

                      return (
                        <Link
                          key={index}
                          href={tab.path}
                          prefetch
                          style={{
                            paddingBottom: 2,
                            borderBottomWidth: 2,
                            borderBottomColor: active
                              ? Colors.primary
                              : "transparent",
                            minWidth: 40,
                            paddingHorizontal: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: active ? "white" : Colors.grey,
                              fontFamily: active
                                ? "Poppins_500Medium"
                                : "Poppins_400Regular",
                            }}
                          >
                            {tab.title}
                          </Text>
                        </Link>
                      );
                    })}
                  </View>
                </View>
              </View>
            ),
          })}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="foods" />
          <Tabs.Screen
            name="(create-food)"
            options={{ headerShown: false, headerTitle: "Create Food" }}
          />
        </Tabs>
      </SearchProvider>
    </SnackbarProvider>
  );
}
