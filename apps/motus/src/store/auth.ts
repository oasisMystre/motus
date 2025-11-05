import type z from "zod";
import type { userExtendSelectSchema } from "@motus/server";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type User =
  | {
      type: "anonymous";
      uid?: string | null;
    }
  | ({ type: "firebase"; uid: string } & z.infer<
      typeof userExtendSelectSchema
    >);

type AuthState = {
  user: User | null;
};

export const authSlice = createSlice({
  name: "auth",
  initialState: (): AuthState => ({
    user: null,
  }),
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    updateUser(state, { payload }: PayloadAction<Partial<User>>) {
      state.user = { ...state.user, ...payload } as User;
    },
  },
});

export const authActions = authSlice.actions;
export const authReducer = authSlice.reducer;
