import type z from "zod";
import type { workoutSelectSchema } from "@motus/server";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

export const workoutAdaptar =
  createEntityAdapter<z.infer<typeof workoutSelectSchema>>();

const workoutSlice = createSlice({
  name: "workouts",
  initialState: workoutAdaptar.getInitialState(),
  reducers: {
    addWorkouts: workoutAdaptar.addMany,
  },
});

export const workoutActions = workoutSlice.actions;
export const workoutReducer = workoutSlice.reducer;
export const workoutSelector = workoutAdaptar.getSelectors();
