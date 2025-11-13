import { useMemo } from "react";
import { Tabs, useSegments } from "expo-router";
import { BarbellIcon } from "phosphor-react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { Colors } from "../../constants";

export default function TabsLayout() {
  const segements = useSegments();

  const showNavigation = useMemo(
    () => segements.length <= 2 || segements.includes("(rewards)" as never),
    [segements],
  );

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        tabBarHideOnKeyboard: true,
        headerTitleStyle: {
          fontFamily: "Poppins_500Regular",
        },
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "transparent" },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.grey,
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: Colors.navColor,
          display: showNavigation ? "flex" : "none",
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "400",
          fontFamily: "Poppins_400Regular",
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name="home"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(log)"
        options={{
          title: "Log",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name="bar-chart"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(rewards)"
        options={{
          title: "Rewards",
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="gift"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI Coach",
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <BarbellIcon
              weight="fill"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(more)"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name="more-horiz"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
