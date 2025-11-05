import type z from "zod";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { Text, View, FlatList } from "react-native";
import type { routineSelectSchema } from "@motus/server";
import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { NotepadIcon, PlusIcon } from "phosphor-react-native";

import { Colors } from "../../../../constants";
import Button from "../../../../components/Button";
import { useTRPC } from "../../../../providers/TRPCProvider";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { routineActions, routineSelector } from "../../../../store/routine";
import {
  RoutineListItem,
  RoutineMenu,
} from "../../../../components/create-workout";

export default function CreateWorkoutScreen() {
  const trpc = useTRPC();
  const { t } = useTranslation();
  const [routine, setRoutine] = useState<z.infer<
    typeof routineSelectSchema
  > | null>(null);

  const dispatch = useAppDispatch();
  const routineState = useAppSelector((state) => state.routine);
  const routines = routineSelector.selectAll(routineState);

  const { data } = useQuery(trpc.routine.list.queryOptions());
  const { mutateAsync } = useMutation(
    trpc.routine.create.mutationOptions({
      onSuccess(data) {
        dispatch(routineActions.addRoutine(data));
      },
    }),
  );

  useEffect(() => {
    if (data) dispatch(routineActions.addRoutines(data));
  }, [data]);

  const Header = useCallback(
    () => (
      <View>
        <View
          className="flex-row gap-x-8"
          style={{ marginBottom: 32 }}
        >
          <Button
            icon={<NotepadIcon color="white" />}
            style={{
              flex: 1,
              rowGap: 8,
              flexDirection: "column",
              backgroundColor: Colors.background[5],
            }}
            text={t("log.create_workout.create_routine_action")}
            onPress={() =>
              router.push("/(tabs)/(log)/(create-workout)/(create-routine)")
            }
          />
          <Button
            icon={<PlusIcon color="white" />}
            style={{
              flex: 1,
              rowGap: 8,
              flexDirection: "column",
              backgroundColor: Colors.background[5],
            }}
            text={t("log.create_workout.start_empty_workout_action")}
            onPress={async () => {
              const routine = await mutateAsync({
                name: "Empty Workspace",
                metadata: {
                  exercises: [],
                },
              });

              router.push({
                pathname: "/start-routine",
                params: { id: routine.id },
              });
            }}
          />
        </View>
        {routines.length > 0 && (
          <View>
            <Text
              className="font-poppins-medium"
              style={{ color: Colors.grey }}
            >
              {t("log.create_workout.routine_count", {
                count: routines.length,
              })}
            </Text>
          </View>
        )}
      </View>
    ),
    [t, routines, routine],
  );

  return (
    <>
      <FlatList
        data={routines}
        ListHeaderComponent={Header}
        contentContainerStyle={{ gap: 16 }}
        keyExtractor={(workout) => workout.id}
        style={{ paddingHorizontal: 16, paddingTop: 16 }}
        renderItem={({ item }) => (
          <RoutineListItem
            routine={item}
            onMenu={() => setRoutine(item)}
          />
        )}
      />
      {routine && (
        <RoutineMenu
          routine={routine}
          onClose={() => setRoutine(null)}
        />
      )}
    </>
  );
}
