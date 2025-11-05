import type z from "zod";
import type { userSelectSchema } from "@motus/server";
import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
  type Update,
} from "@reduxjs/toolkit";

export type User = z.infer<typeof userSelectSchema> & {
  isFollowing: boolean;
};

const searchUserEntityAdapter = createEntityAdapter<User>();

const searchSlice = createSlice({
  name: "search",
  initialState: {
    users: searchUserEntityAdapter.getInitialState(),
  },
  reducers: {
    setUsers: (state, { payload }: PayloadAction<User[]>) => {
      searchUserEntityAdapter.setMany(state.users, payload);
    },
    updateUser: (
      state,
      { payload }: PayloadAction<Update<User, User["id"]>>,
    ) => {
      searchUserEntityAdapter.updateOne(state.users, payload);
    },
    removeAllUsers: (state) => {
      searchUserEntityAdapter.removeAll(state.users);
    },
  },
});

export const searchReducer = searchSlice.reducer;
export const searchActions = searchSlice.actions;
export const searchUserSelectors = searchUserEntityAdapter.getSelectors();
