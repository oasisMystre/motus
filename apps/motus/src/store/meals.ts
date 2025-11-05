import type z from "zod";
import type { mealSelectSchema } from "@motus/server";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

const mealEntityAdapter =
  createEntityAdapter<z.infer<typeof mealSelectSchema>>();

export const mealSlice = createSlice({
  name: "meals",
  initialState: mealEntityAdapter.getInitialState(),
  reducers: {
    setMeals: mealEntityAdapter.setMany,
    addMeals: mealEntityAdapter.addMany,
    addMeal: mealEntityAdapter.addOne,
    updateMeal: mealEntityAdapter.updateOne,
    removeAllMeals: mealEntityAdapter.removeAll,
  },
});

export const mealReducer = mealSlice.reducer;
export const mealActions = mealSlice.actions;
export const mealSelectors = mealEntityAdapter.getSelectors();
