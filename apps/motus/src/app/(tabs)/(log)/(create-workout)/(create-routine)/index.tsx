import z from "zod";
import { format } from "util";
import { PlusIcon } from "phosphor-react-native";
import { FormikContext, useFormik } from "formik";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { type exerciseSelectSchema, routineInsertSchema } from "@motus/server";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  FlatList,
} from "react-native";
import { useMemo, useState, useCallback, useLayoutEffect } from "react";

import { Colors } from "../../../../../constants";
import { withZodSchema } from "../../../../../utils";
import Button from "../../../../../components/Button";
import { formActions } from "../../../../../store/form";
import { useTRPC } from "../../../../../providers/TRPCProvider";
import KeyboardView from "../../../../../components/KeyboardView";
import { ListItem } from "../../../../../components/start-routine";
import { ListHeader } from "../../../../../components/create-routine";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { useTanstackStore } from "../../../../../hooks/useTanstackStore";
import TimerSheet from "../../../../../components/bottom-sheets/TimerSheet";
import AddExerciseModal from "../../../../../components/modals/AddExerciseModal";
import ExerciseMenuModal from "../../../../../components/create-routine/ExerciseMenuModal";

function createInitialSet(exercise: z.infer<typeof exerciseSelectSchema>) {
  return {
    ...exercise,
    note: null,
    restTimer: null,
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
  };
}

export default function CreateRoutineScreen() {
  const trpc = useTRPC();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { bottom } = useSafeAreaInsets();
  const { action } = useLocalSearchParams();
  const { createWorkout } = useAppSelector((state) => state.form);

  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [timerFieldName, setTimerFieldName] = useState<string | null>(null);
  const [replaceExercise, setReplaceExercise] = useState<z.infer<
    typeof exerciseSelectSchema
  > | null>(null);
  const [exercise, setExercise] = useState<z.infer<
    typeof exerciseSelectSchema
  > | null>(null);

  const { update } = useTanstackStore(
    queryClient,
    trpc.routine.list.queryKey(),
    (routine) => routine.id,
  );
  const { mutateAsync } = useMutation(
    trpc.routine.create.mutationOptions({
      onSuccess: update,
    }),
  );

  const exercises = useMemo(
    () =>
      createWorkout.exercises.map((exercise) => {
        return {
          ...exercise,
          note: null,
          restTimer: null,
          sets: exercise.sets
            ? exercise.sets.map((set) => {
                const { completed, previous, ...rest } = set;
                return rest;
              })
            : [
                {
                  set: "n",
                  ...Object.fromEntries(
                    exercise.exercise_types.map((tracking) => [tracking, null]),
                  ),
                },
              ],
        };
      }),
    [createWorkout.exercises],
  );

  const formikContext = useFormik({
    validateOnMount: true,
    validate: withZodSchema(
      routineInsertSchema
        .partial()
        .extend({ name: z.string("This field is required").trim() }),
    ),
    initialValues: {
      name: createWorkout?.name!,
      metadata: { exercises },
    },
    async onSubmit(value) {
      await mutateAsync(value);
      return router.back();
    },
  });

  const { isValid, errors, isSubmitting, values, handleSubmit, setFieldValue } =
    formikContext;

  const header = useCallback(
    () => <ListHeader exercises={values.metadata.exercises} />,
    [values.metadata.exercises],
  );

  const disabled = useMemo(
    () => !isValid || isSubmitting,
    [isValid, isSubmitting],
  );

  useLayoutEffect(() => {
    if (action && action === "edit") {
      navigation.setOptions({
        title: "Edit Routine",
      });

      return () => {
        navigation.setOptions({ title: "Create Routine" });
        dispatch(formActions.resetWorkoutForm());
      };
    }

    return () => {
      dispatch(formActions.resetWorkoutForm());
    };
  }, [navigation, action]);

  useLayoutEffect(() => {
    if (values.metadata.exercises.length > 0)
      navigation.setOptions({
        headerRight: () =>
          isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Pressable
              disabled={disabled}
              onPress={() => handleSubmit()}
            >
              <Text
                style={{
                  color: isValid ? Colors.primary : Colors.grey,
                }}
              >
                Save
              </Text>
            </Pressable>
          ),
      });
    else navigation.setOptions({ headerRight: undefined });
  }, [values.metadata.exercises, isSubmitting, isValid]);

  const addExercises = useCallback(
    (values: z.infer<typeof exerciseSelectSchema>[]) => {
      const exercises = values.map(createInitialSet);
      setFieldValue("metadata.exercises", exercises);
    },
    [],
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
      <FormikContext value={formikContext}>
        <KeyboardView className="px-6 absolute inset-0 z-0">
          <View className="pt-4 gap-y-8">
            <FlatList
              data={values.metadata.exercises}
              ListHeaderComponent={header}
              keyExtractor={({ id }) => id}
              showsVerticalScrollIndicator={false}
              contentContainerClassName="gap-y-8 pb-8"
              contentContainerStyle={{
                gap: 32,
                flexGrow: 1,
                paddingBottom: bottom + 96,
              }}
              renderItem={({ item, index }) => (
                <ListItem
                  item={item}
                  index={index}
                  addSet={addSet}
                  errors={errors as any}
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
                      size={18}
                      color="white"
                    />
                  }
                  onPress={() => setShowAddExerciseModal(true)}
                />
              )}
            />
          </View>
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
            onClose={() => setExercise(null)}
            replaceExercise={(exercise) => {
              setReplaceExercise(exercise);
              setTimeout(() => setShowAddExerciseModal(true));
            }}
            removeExercise={(id) => {
              const exercises = values.metadata.exercises.filter(
                (exercise) => exercise.id !== id,
              );
              setFieldValue("metadata.exercises", exercises);
              dispatch(formActions.removeCreateWorkoutExercise({ id }));
            }}
          />
        )}
        <AddExerciseModal
          replace={Boolean(replaceExercise)}
          visible={showAddExerciseModal}
          values={exercises}
          onRequestClose={() => {
            setReplaceExercise(null);
            setShowAddExerciseModal(false);
          }}
          onValueChange={(addedExercises) => {
            if (replaceExercise) {
              const [exercise] = addedExercises;
              const exercises = [...values.metadata.exercises] as ReturnType<
                typeof createInitialSet
              >[];
              const index = exercises.findIndex(
                (item) => item.id === replaceExercise.id,
              );
              if (index > -1) {
                exercises[index] = createInitialSet(exercise);
                setFieldValue("metadata.exercises", exercises);
              }
              return;
            }

            return addExercises(addedExercises);
          }}
        />
      </FormikContext>
    </>
  );
}
