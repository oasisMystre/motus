import type z from "zod";
import type { streakSelectSchema } from "@motus/server";
import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

const streakEntityAdapter =
  createEntityAdapter<z.infer<typeof streakSelectSchema>>();

type ExtraState = {
  currentSteps: number;
  longestStreak?: number;
};

export const streakSlice = createSlice({
  name: "streaks",
  initialState: streakEntityAdapter.getInitialState<ExtraState>({
    currentSteps: 0,
  }),
  reducers: {
    setCurrentSteps(state, { payload }: PayloadAction<number>) {
      state.currentSteps = payload;
    },
    setLongestStreak(state, { payload }: PayloadAction<number | undefined>) {
      state.longestStreak = payload;
    },
    setStreaks: streakEntityAdapter.setAll,
    addStreaks: streakEntityAdapter.addMany,
    addStreak: streakEntityAdapter.addOne,
    updateStreak: streakEntityAdapter.updateOne,
  },
});

export const streakReducer = streakSlice.reducer;
export const streakActions = streakSlice.actions;
export const streakSelectors = streakEntityAdapter.getSelectors();
