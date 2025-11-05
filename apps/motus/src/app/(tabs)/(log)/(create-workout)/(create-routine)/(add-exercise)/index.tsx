import type z from "zod";
import { format } from "util";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, RefreshControl } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { BarbellIcon, PlusIcon } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { equipmentSelectSchema, muscleSelectSchema } from "@motus/server";
import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";

import { Colors } from "../../../../../../constants";
import Button from "../../../../../../components/Button";
import { formActions } from "../../../../../../store/form";
import { useTRPC } from "../../../../../../providers/TRPCProvider";
import SearchInput from "../../../../../../components/SearchInput";
import KeyboardView from "../../../../../../components/KeyboardView";
import { useAppDispatch, useAppSelector } from "../../../../../../store";
import MuscleListModal from "../../../../../../components/modals/MuscleListModal";
import EquipmentListModal from "../../../../../../components/modals/EquipmentListModal";
import {
  exerciseActions,
  exerciseSelector,
} from "../../../../../../store/exercise";

export default function AddExerciseScreen() {
  const trpc = useTRPC();
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const [search, setSearch] = useState<string>();
  const [showMuscles, setShowShowMuscles] = useState(false);
  const [showEquipments, setShowEquipments] = useState(false);
  const [muscle, setMuscle] = useState<z.infer<
    typeof muscleSelectSchema
  > | null>(null);
  const [equipment, setEquipment] = useState<z.infer<
    typeof equipmentSelectSchema
  > | null>(null);

  const dispatch = useAppDispatch();
  const { createWorkout } = useAppSelector((state) => state.form);
  const { exercises, customExercises } = useAppSelector(
    (state) => state.exercise,
  );

  const allExercises = exerciseSelector.selectAll(exercises);
  const allCustomExercises = exerciseSelector.selectAll(customExercises);
  const sections = useMemo(
    () => [
      {
        title: t("log.create_workout.add_exercise.custom_exercises"),
        custom: true,
        data: [...allCustomExercises],
      },
      {
        title: t("log.create_workout.add_exercise.exercises"),
        data: [...allExercises],
      },
    ],
    [allCustomExercises, allExercises],
  );

  const { data, isPending, isRefetching, refetch } = useQuery(
    trpc.exercise.list.queryOptions({
      search,
      filter: { muscle: muscle?.id, equipment: equipment?.id },
    }),
  );

  const isSearching = useMemo(
    () => Boolean(search && search.length > 0 && isPending),
    [isPending, search],
  );

  useEffect(() => {
    if (data) {
      dispatch(exerciseActions.setExercises(data.default));
      dispatch(exerciseActions.setCustomExercises(data.custom));
    }
  }, [data]);

  return (
    <>
      <KeyboardView>
        <View className="flex-1 gap-y-8">
          <View className="gap-y-4">
            <SearchInput
              isSearching={isSearching}
              inputAttrs={{
                placeholder: "Search Exercises",
                onChangeText: setSearch,
              }}
            />
            <View className="flex-row gap-x-8">
              <Pressable
                style={style.button}
                onPress={() => setShowEquipments(true)}
              >
                <Text className="text-white font-poppins">
                  {t("log.create_workout.add_exercise.all_equipments_action")}
                </Text>
              </Pressable>
              <Pressable
                style={style.button}
                onPress={() => setShowShowMuscles(true)}
              >
                <Text className="text-white font-poppins">
                  {t("log.create_workout.add_exercise.all_muscles_action")}
                </Text>
              </Pressable>
            </View>
          </View>
          <SectionList
            sections={sections}
            stickyHeaderHiddenOnScroll
            keyExtractor={({ id }) => id}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={Colors.primary}
              />
            }
            renderSectionHeader={({ section: { title, custom, data } }) => (
              <>
                {data.length > 0 && (
                  <View className="flex-row">
                    <Text
                      className="flex-1 text-white font-poppins"
                      style={{ color: Colors.grey }}
                    >
                      {title} {custom && format("(%d/%d)", data.length, 5)}
                    </Text>
                    {custom && (
                      <Pressable>
                        <Text className="text-primary font-poppins-medium">
                          {t(
                            "log.create_workout.add_exercise.unlock_more_action",
                          )}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </>
            )}
            renderItem={({ section: { custom, data }, item, index }) => {
              let exercises =
                createWorkout && createWorkout.exercises
                  ? [...createWorkout.exercises]
                  : [];
              const selected = exercises.find(
                (exercise) => exercise.id === item.id,
              );

              return (
                <Pressable
                  className="flex-row gap-x-4 px-2 py-4 border-b"
                  style={[
                    {
                      borderColor:
                        data.length > 0 && index < data.length - 1
                          ? Colors.border[1]
                          : undefined,
                    },
                    selected && [
                      { borderStartWidth: 4, borderStartColor: Colors.primary },
                    ],
                  ]}
                  onPress={() => {
                    if (selected)
                      exercises = exercises.filter(
                        (exercise) => exercise.id !== item.id,
                      );
                    // @ts-expect-error
                    else exercises.push(item); // todo

                    dispatch(formActions.updateWorkoutForm({ exercises }));
                  }}
                >
                  <View
                    className="size-16 items-center justify-center rounded-full"
                    style={{ backgroundColor: Colors.darkGray }}
                  >
                    <BarbellIcon
                      size={32}
                      color={Colors.grey}
                      weight="duotone"
                      style={{ transform: [{ rotate: "24deg" }] }}
                    />
                  </View>
                  <View className="">
                    <Text className="text-lg text-white font-poppins-medium">
                      {item.name}
                    </Text>
                    <View className="flex-row items-center gap-x-2">
                      <Text style={{ color: Colors.grey }}>
                        {item.primary_muscle_group.name}
                      </Text>
                      {custom && (
                        <View
                          className="px-2 py-1 rounded-md"
                          style={{ backgroundColor: Colors.background[3] }}
                        >
                          <Text style={{ color: Colors.grey }}>
                            {t("custom")}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            }}
          />
          <View
            className="absolute bottom-0 inset-x-0"
            style={{ paddingBottom: bottom }}
          >
            {createWorkout &&
              createWorkout.exercises &&
              createWorkout.exercises.length > 0 && (
                <Button
                  icon={<PlusIcon color="white" />}
                  text={t(
                    "log.create_workout.add_exercise.add_exercise_action",
                    { count: createWorkout.exercises.length },
                  )}
                  onPress={() => router.dismiss()}
                />
              )}
          </View>
        </View>
      </KeyboardView>
      <EquipmentListModal
        visible={showEquipments}
        values={equipment ? [equipment] : []}
        onValueChange={([equipment]) => setEquipment(equipment)}
        onRequestClose={() => setShowEquipments(false)}
      />
      <MuscleListModal
        visible={showMuscles}
        values={muscle ? [muscle] : []}
        onRequestClose={() => setShowShowMuscles(false)}
        onValueChange={([muscle]) => setMuscle(muscle)}
      />
    </>
  );
}

const style = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background[3],
  },
});
