import type z from "zod";
import type { exerciseSelectSchema } from "@motus/server";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type FormState = {
  signup: Partial<{
    email: string;
    password: string;
  }> | null;
  createWorkout: {
    name?: string;
    exercises: (z.infer<typeof exerciseSelectSchema> & {
      sets: { [key: string]: any; completed: boolean }[];
    })[];
  };
  workoutLog: {
    type: string;
    title: string;
    routine: {
      id: string;
      name: string;
    };
    sets: number;
    volume: {
      value: number;
      unit: "kg" | "ibs" | "km";
    };
    duration: number;
    metadata: {
      exercises: (z.infer<typeof exerciseSelectSchema> & {
        sets: { [key: string]: any; completed: boolean }[];
      })[];
    };
  } | null;
};

export const formSlice = createSlice({
  name: "form",
  initialState: (): FormState => ({
    signup: null,
    createWorkout: {
      exercises: [],
    },
    workoutLog: null,
  }),
  reducers: {
    updateSignupForm(state, { payload }: PayloadAction<FormState["signup"]>) {
      if (state.signup) state.signup = { ...state.signup, ...payload };
      else state.signup = payload;
    },
    resetWorkoutForm(state) {
      state.createWorkout = {
        exercises: [],
      };
    },
    updateWorkoutForm(
      state,
      { payload }: PayloadAction<FormState["createWorkout"]>,
    ) {
      if (state.createWorkout)
        state.createWorkout = { ...state.createWorkout, ...payload };
      else state.createWorkout = payload;
    },
    setWorkoutLog(state, { payload }: PayloadAction<FormState["workoutLog"]>) {
      if (state.workoutLog)
        state.workoutLog = { ...state.workoutLog, ...payload };
      else state.workoutLog = payload;
    },
    removeCreateWorkoutExercise(
      state,
      {
        payload,
      }: PayloadAction<{ id: z.infer<typeof exerciseSelectSchema>["id"] }>,
    ) {
      const exercises = state.createWorkout.exercises.filter(
        (exercise) => exercise.id !== payload.id,
      );

      state.createWorkout = { ...state.createWorkout, exercises };
    },
  },
});

export const formActions = formSlice.actions;
export const formReducer = formSlice.reducer;
