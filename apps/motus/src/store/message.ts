import type z from "zod";
import type { messageSelectSchema } from "@motus/server";
import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

export type IMessage = Omit<z.infer<typeof messageSelectSchema>, "user"> & {
  system?: boolean;
  sent?: boolean;
  recieved?: boolean;
};

const messageEntityAdapter = createEntityAdapter<IMessage>({
  sortComparer: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
});

const normalizeMessage = (
  message: Omit<z.infer<typeof messageSelectSchema>, "user">,
  overrides?: { sent?: boolean; recieved?: boolean },
): IMessage => ({
  ...message,
  ...overrides,
  system: ["system", "assistant"].includes(message.role),
});

const messageSlice = createSlice({
  name: "messages",
  initialState: messageEntityAdapter.getInitialState(),
  reducers: {
    setMessages(
      state,
      {
        payload,
      }: PayloadAction<Omit<z.infer<typeof messageSelectSchema>, "user">[]>,
    ) {
      messageEntityAdapter.setMany(
        state,
        payload.map((message) =>
          normalizeMessage(message, { sent: true, recieved: true }),
        ),
      );
    },
    addMessages: messageEntityAdapter.addMany,
    addMessage(
      state,
      {
        payload,
      }: PayloadAction<Omit<z.infer<typeof messageSelectSchema>, "user">>,
    ) {
      messageEntityAdapter.addOne(state, normalizeMessage(payload));
    },
    upsertMessages(
      state,
      {
        payload,
      }: PayloadAction<Omit<z.infer<typeof messageSelectSchema>, "user">[]>,
    ) {
      messageEntityAdapter.upsertMany(
        state,
        payload.map((message) =>
          normalizeMessage(message, { sent: true, recieved: true }),
        ),
      );
    },
  },
});

export const messageActions = messageSlice.actions;
export const messageReducer = messageSlice.reducer;
export const messageSelectors = messageEntityAdapter.getSelectors();
