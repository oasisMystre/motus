import type z from "zod";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { useCallback, useState } from "react";
import type { routineSelectSchema } from "@motus/server";
import { NotepadIcon, PlusIcon } from "phosphor-react-native";
import { Text, View, FlatList, ActivityIndicator } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Colors } from "../../../../constants";
import Button from "../../../../components/Button";
import { useTRPC } from "../../../../providers/TRPCProvider";
import { useTanstackStore } from "../../../../hooks/useTanstackStore";
import {
  RoutineListItem,
  RoutineMenu,
} from "../../../../components/create-workout";

export default function CreateWorkoutScreen() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [routine, setRoutine] = useState<z.infer<
    typeof routineSelectSchema
  > | null>(null);

  const { add } = useTanstackStore(queryClient, trpc.routine.list.queryKey());

  const { data: routines = [], isFetching } = useQuery({
    initialData: [],
    ...trpc.routine.list.queryOptions(),
  });

  const { mutateAsync, isPending } = useMutation(
    trpc.routine.create.mutationOptions({
      onSuccess: add,
    }),
  );

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
            disabled={isPending}
            icon={
              isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <PlusIcon color="white" />
              )
            }
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
    [t, routines, isPending, mutateAsync],
  );

  return (
    <>
      <FlatList
        data={routines}
        ListHeaderComponent={Header}
        contentContainerStyle={{ gap: 16 }}
        keyExtractor={(workout) => workout.id}
        style={{ paddingHorizontal: 16, paddingTop: 16 }}
        ListEmptyComponent={() => {
          if (isFetching)
            return (
              <ActivityIndicator
                color="white"
                size={32}
              />
            );
          return null;
        }}
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
