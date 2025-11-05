import clsx from "clsx";
import { View, Text } from "react-native";
import { Link, Slot, usePathname, useSegments } from "expo-router";

export default function RewardsLayout() {
  const segments = useSegments();
  const tabs: {
    name: string;
    path: React.ComponentProps<typeof Link>["href"];
  }[] = [
    {
      name: "Rewards",
      path: "/(tabs)/(rewards)",
    },
    {
      name: "Streaks",
      path: "/(tabs)/(rewards)/streaks",
    },
  ];

  return (
    <View className="flex-1 px-6 relative">
      <View
        className="flex-row rounded-full mt-4 overflow-hidden"
        style={{
          backgroundColor: "#1E1E1E",
        }}
      >
        {tabs.map((tab, index) => {
          const paths = tab.path.toString().split(/\//).filter(Boolean);

          const selected =
            segments.every((segment) =>
              paths.find((path) => segment === path),
            ) && paths.length === segments.length;

          return (
            <Link
              key={index}
              href={tab.path}
              className="flex-1 flex-row"
            >
              <View
                className={clsx(
                  "flex-1  w-full items-center justify-center p-2",
                  selected && "bg-primary",
                )}
                style={{ borderRadius: 100 }}
              >
                <Text className="text-white font-poppins">{tab.name}</Text>
              </View>
            </Link>
          );
        })}
      </View>
      <Slot />
    </View>
  );
}
