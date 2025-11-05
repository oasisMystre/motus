import { useState } from "react";
import { type Link, router } from "expo-router";
import { Pressable, Text } from "react-native";
import { SectionList, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { Colors } from "../../../constants";
import LogoutModal from "../../../components/modals/LogoutModal";

export default function MoreScreen() {
  const [showLogout, setShowLogout] = useState(false);

  const sections: {
    title: string;
    data: {
      name: string;
      path?: React.ComponentProps<typeof Link>["href"];
      icon: (
        props: Omit<React.ComponentProps<typeof MaterialIcons>, "name">,
      ) => React.ReactNode;
    }[];
  }[] = [
    {
      title: "Account",
      data: [
        {
          name: "Profile",
          path: "/(tabs)/(more)/(profile)",
          icon: (props) => (
            <MaterialIcons
              {...props}
              name="person"
            />
          ),
        },
        {
          name: "Account",
          path: "/(tabs)/(more)/(account)",
          icon: (props) => (
            <MaterialIcons
              {...props}
              name="info-outline"
            />
          ),
        },
        {
          name: "Manage Subscription",
          path: "/(tabs)/(more)/subscription",
          icon: (props) => (
            <MaterialIcons
              {...props}
              name="money"
            />
          ),
        },
        {
          name: "Notifications",
          path: "/(tabs)/(more)/notification",
          icon: (props) => (
            <MaterialIcons
              {...props}
              name="notifications"
            />
          ),
        },
      ],
    },
    {
      title: "Preference",
      data: [
        {
          name: "Privacy",
          icon: (props) => (
            <MaterialIcons
              {...props}
              name="security"
            />
          ),
        },
        {
          name: "Appearence",
          icon: (props) => (
            <MaterialIcons
              {...props}
              name="dashboard-customize"
            />
          ),
        },
      ],
    },
    {
      title: "Help",
      data: [
        {
          name: "About us",
          icon: (props) => (
            <Ionicons
              {...props}
              name="barbell-outline"
            />
          ),
        },
        {
          name: "Contact Support",
          icon: (props) => (
            <MaterialIcons
              {...props}
              name="mail-outline"
            />
          ),
        },
        {
          name: "Frequently Asked Questions",
          icon: (props) => (
            <MaterialIcons
              {...props}
              name="question-mark"
            />
          ),
        },
      ],
    },
  ];

  return (
    <>
      <SectionList
        sections={sections}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section: { title } }) => (
          <Text
            className="text-white p-4 font-poppins"
            style={{ color: Colors.grey }}
          >
            {title}
          </Text>
        )}
        ListFooterComponent={() => (
          <View className="py-8">
            <Pressable
              className="self-center p-2"
              onPress={() => setShowLogout(true)}
            >
              <Text className="text-red-500 font-poppins">Log out</Text>
            </Pressable>
          </View>
        )}
        renderItem={({ section: { data }, index }) => {
          const item = data[index];

          return (
            <Pressable
              className="flex-row items-center gap-x-4 px-8 py-5 last:border-b"
              style={{
                backgroundColor: Colors.darkGray,
                borderColor: Colors.dividerColor,
              }}
              onPress={() => {
                if (item.path) router.push(item.path);
              }}
            >
              <item.icon
                color="white"
                size={18}
              />
              <Text className="text-white font-poppins">{item.name}</Text>
            </Pressable>
          );
        }}
      />
      {showLogout && (
        <LogoutModal
          visible={showLogout}
          onRequestClose={() => setShowLogout(false)}
        />
      )}
    </>
  );
}
