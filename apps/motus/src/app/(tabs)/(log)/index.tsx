import Color from "color";
import { useMemo, useState } from "react";
import { type Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, Text } from "react-native";
import { FlatGrid } from "react-native-super-grid";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BarbellIcon,
  BowlSteamIcon,
  CalendarCheckIcon,
} from "phosphor-react-native";

import { Colors } from "../../../constants";
import useDimensions from "../../../hooks/useDimensions";
import StepSheet from "../../../components/bottom-sheets/StepSheet";

export default function LogScreen() {
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();
  const { width } = useDimensions("window");
  const [showStepModal, setShowStepModal] = useState(false);

  const logItems: {
    name: string;
    icon: (props: { color: string; size: number }) => React.ReactNode;
    onPress?: () => void;
    path?: React.ComponentProps<typeof Link>["href"];
  }[] = useMemo(
    () => [
      {
        name: t("log.create_workout.title"),
        icon: (props) => (
          <BarbellIcon
            {...props}
            color="#34A853"
          />
        ),
        path: "/(create-workout)/(log-workout)",
      },
      {
        name: t("log.log_meal.title"),
        icon: (props) => (
          <BowlSteamIcon
            {...props}
            weight="fill"
            color="#EA4335"
          />
        ),
        path: "/(log-meal)",
      },
      {
        name: t("log.create_goal.title"),
        icon: (props) => (
          <CalendarCheckIcon
            {...props}
            color="#8FB632"
          />
        ),
        path: "/(tabs)/(log)/(create-goal)",
      },
      {
        name: t("log.step.title"),
        icon: (props) => (
          <Ionicons
            {...props}
            color="white"
            name="footsteps"
          />
        ),
        onPress() {
          setShowStepModal(true);
        },
      },
      {
        name: t("log.log_workout.title"),
        icon: (props) => (
          <BarbellIcon
            {...props}
            weight="fill"
            color="#B860E7"
            style={{ transform: [{ rotate: "-30deg" }] }}
          />
        ),
        path: "/(tabs)/(log)/(create-workout)",
      },
    ],
    [t],
  );

  return (
    <>
      <FlatGrid
        data={logItems}
        itemDimension={width / 2 - 16}
        style={{ paddingTop: top * 2 }}
        renderItem={({ item }) => {
          const Icon = item.icon;

          return (
            <Pressable
              style={{
                flex: 1,
                height: 80,
                rowGap: 8,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 16,
                backgroundColor: Color(Colors.darkGray).alpha(0.5).hexa(),
              }}
              onPress={() => {
                if (item.path) router.push(item.path);
                else item.onPress?.();
              }}
            >
              <Icon
                color="white"
                size={28}
              />
              <Text
                className="text-lg text-white font-poppins text-nowrap"
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        }}
      />
      {showStepModal && <StepSheet onClose={() => setShowStepModal(false)} />}
    </>
  );
}
