import type z from "zod";
import type { postExtendedSelectSchema } from "@motus/server";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

const postEntityAdapter = createEntityAdapter<
  z.infer<typeof postExtendedSelectSchema>
>({
  sortComparer: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
});

export const postSlice = createSlice({
  name: "posts",
  initialState: postEntityAdapter.getInitialState(),
  reducers: {
    addPosts: postEntityAdapter.addMany,
    addPost: postEntityAdapter.addOne,
    setPosts: postEntityAdapter.setMany,
    updateOne: postEntityAdapter.updateOne,
  },
});

export const postActions = postSlice.actions;
export const postReducer = postSlice.reducer;
export const postSelector = postEntityAdapter.getSelectors();
