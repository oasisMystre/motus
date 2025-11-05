import type z from "zod";
import type {
  mealLogSelectSchema,
  routineLogSelectSchema,
  workoutLogSelectSchema,
} from "@motus/server";
import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
  type Update,
} from "@reduxjs/toolkit";

const mealLogEntityAdapter =
  createEntityAdapter<z.infer<typeof mealLogSelectSchema>>();
const routineLogEntityAdapter =
  createEntityAdapter<z.infer<typeof routineLogSelectSchema>>();
const workoutLogEntityAdapter =
  createEntityAdapter<z.infer<typeof workoutLogSelectSchema>>();

export const logSlice = createSlice({
  name: "logs",
  initialState: {
    meal: mealLogEntityAdapter.getInitialState(),
    routine: routineLogEntityAdapter.getInitialState(),
    workout: workoutLogEntityAdapter.getInitialState(),
  },
  reducers: {
    setMealLogs(
      state,
      { payload }: PayloadAction<z.infer<typeof mealLogSelectSchema>[]>,
    ) {
      mealLogEntityAdapter.setAll(state.meal, payload);
    },
    addMealLogs(
      state,
      { payload }: PayloadAction<z.infer<typeof mealLogSelectSchema>[]>,
    ) {
      mealLogEntityAdapter.addMany(state.meal, payload);
    },
    addMealLog(
      state,
      { payload }: PayloadAction<z.infer<typeof mealLogSelectSchema>>,
    ) {
      mealLogEntityAdapter.addOne(state.meal, payload);
    },
    updateMealLog(
      state,
      {
        payload,
      }: PayloadAction<Update<z.infer<typeof mealLogSelectSchema>, string>>,
    ) {
      mealLogEntityAdapter.updateOne(state.meal, payload);
    },
    removeMealLog(
      state,
      { payload }: PayloadAction<z.infer<typeof mealLogSelectSchema>["id"]>,
    ) {
      mealLogEntityAdapter.removeOne(state.meal, payload);
    },
    setRoutineLogs(
      state,
      { payload }: PayloadAction<z.infer<typeof routineLogSelectSchema>[]>,
    ) {
      routineLogEntityAdapter.setAll(state.routine, payload);
    },
    addRoutineLogs(
      state,
      { payload }: PayloadAction<z.infer<typeof routineLogSelectSchema>[]>,
    ) {
      routineLogEntityAdapter.addMany(state.routine, payload);
    },
    addRoutineLog(
      state,
      { payload }: PayloadAction<z.infer<typeof routineLogSelectSchema>>,
    ) {
      routineLogEntityAdapter.addOne(state.routine, payload);
    },
    updateRoutineLog(
      state,
      {
        payload,
      }: PayloadAction<Update<z.infer<typeof routineLogSelectSchema>, string>>,
    ) {
      routineLogEntityAdapter.updateOne(state.routine, payload);
    },
    deleteRoutineLog(
      state,
      { payload }: PayloadAction<z.infer<typeof routineLogSelectSchema>["id"]>,
    ) {
      routineLogEntityAdapter.removeOne(state.routine, payload);
    },
    addWorkouts(
      state,
      { payload }: PayloadAction<z.infer<typeof workoutLogSelectSchema>[]>,
    ) {
      workoutLogEntityAdapter.addMany(state.workout, payload);
    },
    setWorkouts(
      state,
      { payload }: PayloadAction<z.infer<typeof workoutLogSelectSchema>[]>,
    ) {
      workoutLogEntityAdapter.setAll(state.workout, payload);
    },
    addWorkout(
      state,
      { payload }: PayloadAction<z.infer<typeof workoutLogSelectSchema>>,
    ) {
      workoutLogEntityAdapter.addOne(state.workout, payload);
    },
    updateWorkout(
      state,
      {
        payload,
      }: PayloadAction<Update<z.infer<typeof workoutLogSelectSchema>, string>>,
    ) {
      workoutLogEntityAdapter.updateOne(state.workout, payload);
    },
    removeWorkout(
      state,
      { payload }: PayloadAction<z.infer<typeof workoutLogSelectSchema>["id"]>,
    ) {
      workoutLogEntityAdapter.removeOne(state.workout, payload);
    },
  },
});

export const logActions = logSlice.actions;
export const logReducer = logSlice.reducer;

export const mealLogSelector = mealLogEntityAdapter.getSelectors();
export const routineLogSelector = routineLogEntityAdapter.getSelectors();
export const workoutLogSelector = workoutLogEntityAdapter.getSelectors();
