import type z from "zod";
import type { routineSelectSchema } from "@motus/server";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

export const routineAdaptar = createEntityAdapter<
  z.infer<typeof routineSelectSchema>
>({
  sortComparer: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
});

const routineSlice = createSlice({
  name: "routines",
  initialState: routineAdaptar.getInitialState(),
  reducers: {
    addRoutines: routineAdaptar.addMany,
    addRoutine: routineAdaptar.addOne,
    updateRoutine: routineAdaptar.updateOne,
    removeRoutine: routineAdaptar.removeOne,
  },
});

export const routineActions = routineSlice.actions;
export const routineReducer = routineSlice.reducer;
export const routineSelector = routineAdaptar.getSelectors();
