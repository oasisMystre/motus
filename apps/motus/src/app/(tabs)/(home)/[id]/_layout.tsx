import { createContext, useContext } from "react";
import { GearIcon } from "phosphor-react-native";
import { Pressable, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  type Link,
  router,
  Tabs,
  useLocalSearchParams,
  useSegments,
} from "expo-router";

import { Colors } from "../../../../constants";
import Avatar from "../../../../components/Avatar";
import { useUser } from "../../../../hooks/useUser";
import { BackButton } from "../../../../components/Header";
import type { useTRPCClient } from "../../../../providers/TRPCProvider";

type ProfileContext = {
  profile?: Awaited<
    ReturnType<ReturnType<typeof useTRPCClient>["user"]["retrieve"]["query"]>
  > | null;
};

const ProfileContext = createContext<ProfileContext | null>(null);

export const useProfile = () => useContext(ProfileContext) as ProfileContext;

export default function ProfileLayout() {
  const segments = useSegments();
  const { top } = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const tabs: {
    title: string;
    path: Extract<React.ComponentProps<typeof Link>["href"], string>;
  }[] = [
    { title: "My Info", path: `/(tabs)/(home)/${id}` },
    { title: "My Items", path: `/(tabs)/(home)/${id}/items` },
  ];

  const user = useUser(id);

  return (
    <Tabs
      screenOptions={({ navigation }) => ({
        title: "Profile",
        headerShadowVisible: false,
        tabBarStyle: { display: "none" },
        header() {
          return (
            <View
              className="gap-y-4"
              style={{ marginTop: top }}
            >
              <View className="flex-row items-center px-6">
                <BackButton
                  canGoBack
                  navigation={navigation}
                />
                <Text className="flex-1 text-white font-poppins-medium text-center">
                  Profile
                </Text>
                <Pressable onPress={() => router.push("/(tabs)/(more)")}>
                  <GearIcon color="white" />
                </Pressable>
              </View>
              {user && (
                <View className="gap-y-8">
                  <View className="items-center justify-center gap-y-2">
                    <Avatar
                      url={user.profile.avatar}
                      style={{ width: 72, height: 72 }}
                    />
                    <Text
                      className="font-poppins"
                      style={{ color: Colors.grey }}
                    >
                      {user.name}
                    </Text>
                  </View>
                  <View className="flex-row">
                    {tabs.map((tab, index) => {
                      const selected =
                        tab.path.split(/\//g).filter(Boolean).length ===
                        segments.length;

                      return (
                        <Pressable
                          key={index}
                          style={{
                            flex: 1,
                            paddingBottom: 8,
                            borderBottomWidth: 3,
                            borderBottomColor: selected
                              ? Colors.primary
                              : Colors.grey,
                          }}
                          onPress={() => router.replace(tab.path)}
                        >
                          <Text className="text-white font-poppins text-center">
                            {tab.title}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="items" />
    </Tabs>
  );
}
