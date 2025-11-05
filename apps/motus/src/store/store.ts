import { configureStore } from "@reduxjs/toolkit";

import { logReducer } from "./log";
import { authReducer } from "./auth";
import { formReducer } from "./form";
import { postReducer } from "./post";
import { mealReducer } from "./meals";
import { searchReducer } from "./search";
import { rewardReducer } from "./reward";
import { streakReducer } from "./streak";
import { workoutReducer } from "./workout";
import { routineReducer } from "./routine";
import { metadataReducer } from "./metadata";
import { exerciseReducer } from "./exercise";
import { commentReducer } from "./comment";
import { messageReducer } from "./message";

export const store = configureStore({
  reducer: {
    log: logReducer,
    auth: authReducer,
    form: formReducer,
    post: postReducer,
    meal: mealReducer,
    search: searchReducer,
    reward: rewardReducer,
    streak: streakReducer,
    routine: routineReducer,
    workout: workoutReducer,
    message: messageReducer,
    exercise: exerciseReducer,
    metadata: metadataReducer,
    comment: commentReducer,
  },
  middleware: (gdm) => gdm({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
