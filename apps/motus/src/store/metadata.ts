import type z from "zod";
import type { equipmentSelectSchema, muscleSelectSchema } from "@motus/server";
import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

export const muscleAdapter =
  createEntityAdapter<z.infer<typeof muscleSelectSchema>>();
export const equipmentAdapter =
  createEntityAdapter<z.infer<typeof equipmentSelectSchema>>();

export const metadata = createSlice({
  name: "metadata",
  initialState: {
    muscles: muscleAdapter.getInitialState(),
    equipments: equipmentAdapter.getInitialState(),
  },
  reducers: {
    addEquipments: (
      state,
      { payload }: PayloadAction<z.infer<typeof equipmentSelectSchema>[]>,
    ) => {
      equipmentAdapter.addMany(state.equipments, payload);
    },
    addMuscles(
      state,
      { payload }: PayloadAction<z.infer<typeof muscleSelectSchema>[]>,
    ) {
      muscleAdapter.addMany(state.muscles, payload);
    },
  },
});

export const metadataReducer = metadata.reducer;
export const metadataActions = metadata.actions;
export const muscleSelectors = muscleAdapter.getSelectors();
export const equipmentSelectors = equipmentAdapter.getSelectors();
