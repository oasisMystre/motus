import type z from "zod";
import type { exerciseSelectSchema } from "@motus/server";
import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

export const exerciseAdaptar =
  createEntityAdapter<z.infer<typeof exerciseSelectSchema>>();

export const customExerciseAdaptar =
  createEntityAdapter<z.infer<typeof exerciseSelectSchema>>();

const exerciseSlice = createSlice({
  name: "exercise",
  initialState: {
    exercises: exerciseAdaptar.getInitialState(),
    customExercises: customExerciseAdaptar.getInitialState(),
  },
  reducers: {
    setExercises: (
      state,
      { payload }: PayloadAction<z.infer<typeof exerciseSelectSchema>[]>,
    ) => {
      exerciseAdaptar.setAll(state.exercises, payload);
    },
    setCustomExercises: (
      state,
      { payload }: PayloadAction<z.infer<typeof exerciseSelectSchema>[]>,
    ) => {
      exerciseAdaptar.setAll(state.customExercises, payload);
    },
    addExercises: (
      state,
      { payload }: PayloadAction<z.infer<typeof exerciseSelectSchema>[]>,
    ) => {
      exerciseAdaptar.addMany(state.exercises, payload);
    },
    addCustomExercises: (
      state,
      { payload }: PayloadAction<z.infer<typeof exerciseSelectSchema>[]>,
    ) => {
      exerciseAdaptar.addMany(state.customExercises, payload);
    },

    addCustomExercise: (
      state,
      { payload }: PayloadAction<z.infer<typeof exerciseSelectSchema>>,
    ) => {
      exerciseAdaptar.addOne(state.customExercises, payload);
    },
  },
});

export const exerciseActions = exerciseSlice.actions;
export const exerciseReducer = exerciseSlice.reducer;
export const exerciseSelector = exerciseAdaptar.getSelectors();
export const customExerciseSelector = customExerciseAdaptar.getSelectors();
