import type z from "zod";
import ms from "pretty-ms";
import { format } from "util";
import { useFormik } from "formik";

import type { exerciseSelectSchema } from "@motus/server";
import { array, boolean, number, object, string } from "yup";
import { BarbellIcon, PlusIcon } from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useLocalSearchParams, router } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
  ActivityIndicator,
  Text,
  Pressable,
  View,
  FlatList,
} from "react-native";

import { Colors } from "../../../../constants";
import useTimer from "../../../../hooks/useTimer";
import Button from "../../../../components/Button";
import { useAppDispatch } from "../../../../store";
import { formActions } from "../../../../store/form";
import useRoutine from "../../../../hooks/useRoutine";
import { routineActions } from "../../../../store/routine";
import KeyboardView from "../../../../components/KeyboardView";
import TimerSheet from "../../../../components/bottom-sheets/TimerSheet";
import { ListHeader, ListItem } from "../../../../components/start-routine";
import ExerciseMenuModal from "../../../../components/create-routine/ExerciseMenuModal";
import AddExerciseModal from "../../../../components/modals/AddExerciseModal";
import type { WorkoutLog } from "../../../../components/modals/PostRoutineModal";
import PostRoutineModal from "../../../../components/modals/PostRoutineModal";

const createInitialSet = (value: any) => {
  const { set, previous, ...rest } = value;
  const values = [
    rest.weight,
    rest.distance,
    rest.time ? ms(parseFloat(rest.time)) : undefined,
    rest.reps,
  ].filter(Boolean);

  return {
    set: "n",
    previous: values.join("x"),
    ...rest,
    completed: false,
  };
};

const validationSchema = object({
  sets: number().required(),
  duration: number().required(),
  volume: object({
    value: number(),
    unit: string().oneOf(["kg", "ibs", "km"]),
  }),
  metadata: object({
    exercises: array(
      object({
        sets: array(
          object({
            completed: boolean().required(),
          })
            .required()
            .test("all-field-is-required", "all field is required", (value) => {
              let valid = true;
              const integerKeys = ["time", "reps", "weight"] as const;

              for (const key of integerKeys) {
                if (key in value)
                  valid =
                    valid &&
                    !Number.isNaN(
                      parseFloat(
                        value[key as keyof typeof value] as unknown as string,
                      ),
                    );
              }

              if (valid) return valid;
              return false;
            }),
        ).required(),
      }).required(),
    ),
  }),
});

export default function StartRoutine() {
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog | null>(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [timerFieldName, setTimerFieldName] = useState<string | null>(null);
  const [exercise, setExercise] = useState<z.infer<
    typeof exerciseSelectSchema
  > | null>(null);

  const routine = useRoutine(id);
  const dispatch = useAppDispatch();

  const exercises = useMemo(
    () =>
      routine.metadata.exercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map(createInitialSet),
      })),
    [routine],
  );

  const { values, isValid, isSubmitting, errors, setFieldValue, handleSubmit } =
    useFormik({
      validateOnMount: true,
      validationSchema,
      initialValues: {
        sets: 0,
        duration: 0,
        type: "routine",
        routine: {
          id: routine.id,
          name: routine.name,
        },
        volume: {
          value: 0,
          unit: "kg" as const,
        },
        metadata: {
          exercises,
        },
      },

      async onSubmit(values) {
        setWorkoutLog({ ...values, title: routine.name });
      },
    });

  useTimer(() => {
    setFieldValue("duration", values.duration + 1000);
  });

  useEffect(() => {
    const completedSets = values.metadata.exercises.reduce(
      (acc, exercise) =>
        acc + exercise.sets.filter((set) => set.completed).length,
      0,
    );

    const totalVolume = values.metadata.exercises.reduce(
      (acc, exercise) =>
        acc +
        exercise.sets
          .map((set) => parseFloat(set.reps ?? 1) * parseFloat(set.weight ?? 0))
          .filter(Boolean)
          .reduce((acc, value) => acc + value, 0),
      0,
    );

    setFieldValue("sets", completedSets);
    setFieldValue("volume.value", totalVolume);
  }, [values.metadata.exercises]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          disabled={!isValid}
          onPress={() => handleSubmit()}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: isValid ? Colors.primary : Colors.grey }}>
              Finish
            </Text>
          )}
        </Pressable>
      ),
    });

    return () => {
      navigation.setOptions({ headerRight: undefined });
      dispatch(formActions.setWorkoutLog({ ...values, title: routine.name }));
    };
  }, [isValid, isSubmitting]);

  const removeExercise = useCallback(
    (id: string) => {
      const exercises = values.metadata.exercises.filter(
        (exercise) => exercise.id !== id,
      );
      dispatch(
        routineActions.updateRoutine({
          id: routine.id,
          changes: { metadata: { exercises } },
        }),
      );
      setFieldValue("metadata.exercises", exercises);
    },
    [values.metadata.exercises, setFieldValue],
  );

  const addSet = useCallback(
    (index: number) => {
      const exercise = values.metadata.exercises[index];
      const firstSet = exercise?.sets?.at(0);

      if (firstSet) {
        const newSet = Object.fromEntries(
          Object.keys(firstSet).map((key) => {
            if (key === "set") return [key, "n"];
            if (key === "previous") return [key, undefined];
            if (key === "completed") return [key, false];
            return [key, undefined];
          }),
        );

        const updatedSets = [...exercise?.sets, newSet];
        setFieldValue(format("metadata.exercises.%d.sets", index), updatedSets);
      }
    },
    [values.metadata.exercises, setFieldValue],
  );

  const removeSet = useCallback(
    (index: number) => {
      const exercise = values.metadata.exercises[index];

      if (exercise?.sets?.length > 1) {
        const updatedSets = exercise.sets.slice(0, -1);
        setFieldValue(format("metadata.exercises.%d.sets", index), updatedSets);
      }
    },
    [values.metadata.exercises, setFieldValue],
  );

  return (
    <>
      <KeyboardView style={{ marginBottom: bottom }}>
        <FlatList
          data={values.metadata.exercises}
          keyExtractor={(exercise) => exercise.id}
          ListHeaderComponent={() => <ListHeader values={values} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ rowGap: 32, columnGap: 16 }}
          renderScrollComponent={(props) => (
            <KeyboardAwareScrollView {...props} />
          )}
          ListEmptyComponent={() => {
            return (
              <View className="items-center justify-center gap-y-4">
                <BarbellIcon
                  color={Colors.grey}
                  size={48}
                />
                <View>
                  <Text className="text-center text-lg text-white font-poppins-medium">
                    Get started
                  </Text>
                  <Text
                    className="text-center font-poppins"
                    style={{ color: Colors.grey }}
                  >
                    Add an exercise to start your workout
                  </Text>
                </View>
              </View>
            );
          }}
          renderItem={({ item, index }) => (
            <ListItem
              item={item}
              index={index}
              addSet={addSet}
              errors={errors}
              removeSet={removeSet}
              onFieldChange={setFieldValue}
              setRestTimer={setTimerFieldName}
              onMenu={() => setExercise(item)}
            />
          )}
          ListFooterComponent={() => (
            <Button
              text="Add Exercise"
              icon={
                <PlusIcon
                  color="white"
                  size={16}
                />
              }
              onPress={() => setShowAddExerciseModal(true)}
            />
          )}
        />
      </KeyboardView>
      {timerFieldName && (
        <TimerSheet
          style={{ zIndex: 1000 }}
          onClose={() => setTimerFieldName(null)}
          onChange={(value) => setFieldValue(timerFieldName, value)}
        />
      )}
      {exercise && (
        <ExerciseMenuModal
          exercise={exercise}
          removeExercise={removeExercise}
          onClose={() => setExercise(null)}
        />
      )}
      <AddExerciseModal
        visible={showAddExerciseModal}
        values={values.metadata.exercises}
        onValueChange={(values) => {
          setFieldValue(
            "metadata.exercises",
            values.map((exercise) => ({
              ...exercise,
              sets: [
                {
                  set: "n",
                  previous: undefined,
                  ...Object.fromEntries(
                    exercise.exercise_types.map((type) => [type, undefined]),
                  ),
                  completed: false,
                },
              ],
            })),
          );
        }}
        onRequestClose={() => setShowAddExerciseModal(false)}
      />
      {workoutLog && (
        <PostRoutineModal
          workoutLog={workoutLog}
          visible={Boolean(workoutLog)}
          onRequestClose={() => setWorkoutLog(null)}
        />
      )}
    </>
  );
}
