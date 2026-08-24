import { configureStore } from "@reduxjs/toolkit";

import { logReducer } from "./log";
import { formReducer } from "./form";
import { mealReducer } from "./meals";
import { workoutReducer } from "./workout";
import { messageReducer } from "./message";

export const store = configureStore({
  reducer: {
    log: logReducer,
    form: formReducer,
    meal: mealReducer,
    workout: workoutReducer,
    message: messageReducer,
  },
  middleware: (gdm) => gdm({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
