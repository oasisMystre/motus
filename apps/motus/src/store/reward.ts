import type z from "zod";
import type { rewardSelectSchema } from "@motus/server";
import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

const rewardEntityAdapter =
  createEntityAdapter<z.infer<typeof rewardSelectSchema>>();

type ExtraState = {
  points: number;
  newUserReward: z.infer<typeof rewardSelectSchema>;
};

export const rewardSlice = createSlice({
  name: "rewards",
  initialState: rewardEntityAdapter.getInitialState<ExtraState>(
    {} as ExtraState,
  ),
  reducers: {
    addExtra(state, { payload }: PayloadAction<ExtraState>) {
      state.points = payload.points;
      state.newUserReward = payload.newUserReward;
    },
    addRewards: rewardEntityAdapter.addMany,
  },
});

export const rewardReducer = rewardSlice.reducer;
export const rewardActions = rewardSlice.actions;
export const rewardSelectors = rewardEntityAdapter.getSelectors();
