import type z from "zod";
import moment from "moment";
import type { commentSelectSchema } from "@motus/server";
import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

type Comment = z.infer<typeof commentSelectSchema> & {
  sent: boolean;
  failed: boolean;
};

export const mapCommentWithExtra = (
  comment: z.infer<typeof commentSelectSchema>,
  extra: { sent: boolean; failed: boolean },
) => ({ ...comment, ...extra });

export const commentEntityAdapter = createEntityAdapter<Comment>({
  sortComparer: (a, b) => moment(b.createdAt).diff(moment(a.createdAt)),
});

export const commentSlice = createSlice({
  name: "comments",
  initialState: commentEntityAdapter.getInitialState(),
  reducers: {
    addComments: (
      state,
      { payload }: PayloadAction<z.infer<typeof commentSelectSchema>[]>,
    ) => {
      commentEntityAdapter.addMany(
        state,
        payload.map((comment) =>
          mapCommentWithExtra(comment, { sent: true, failed: false }),
        ),
      );
    },
    setComments: commentEntityAdapter.setMany,
    removeAllComment: commentEntityAdapter.removeAll,
    updateComment: commentEntityAdapter.updateOne,
    addComment: commentEntityAdapter.addOne,
  },
});

export const commentActions = commentSlice.actions;
export const commentReducer = commentSlice.reducer;
export const commentSelectors = commentEntityAdapter.getSelectors();
