import type z from "zod";
import { memo, useCallback } from "react";
import { router } from "expo-router";
import type { routineSelectSchema } from "@motus/server";
import { View, Pressable, Text } from "react-native";
import { DotsThreeIcon } from "phosphor-react-native";

import Button from "../Button";
import { Colors } from "../../constants";
import { useTranslation } from "react-i18next";

type RoutinestItemProps = {
  onMenu: () => void;
  routine: z.infer<typeof routineSelectSchema>;
};

export const RoutineListItem = memo(
  ({ routine, onMenu }: RoutinestItemProps) => {
    const { t } = useTranslation();
    const startRoutine = useCallback(() => {
      router.push({
        pathname: "/start-routine",
        params: { id: routine.id },
      });
    }, [routine]);

    return (
      <View
        className="px-4 py-6 rounded-xl gap-y-4"
        style={{ backgroundColor: Colors.background[5] }}
      >
        <View className="flex-row gap-x-2 routines-center">
          <View className="flex-1">
            <Text className="text-lg text-white font-poppins-medium">
              {routine.name}
            </Text>
            <Text
              className="font-poppins"
              style={{ color: Colors.text[1] }}
            >
              {routine.metadata.exercises
                .map((exercise) => exercise.name)
                .join(", ")}
            </Text>
          </View>
          <Pressable
            className="p-2"
            onPress={onMenu}
          >
            <DotsThreeIcon color="white" />
          </Pressable>
        </View>
        <Button
          onPress={startRoutine}
          text={t("log.create_workout.start_routine_action")}
        />
      </View>
    );
  },
);
