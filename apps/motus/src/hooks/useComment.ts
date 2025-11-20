import type z from "zod";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { commentSelectSchema } from "@motus/server";

import { useTRPC } from "../providers/TRPCProvider";

export type Comment = z.infer<typeof commentSelectSchema> & {
  sent: boolean;
  failed: boolean;
};
export const mapCommentWithExtra = (
  comment: z.infer<typeof commentSelectSchema>,
  extra: { sent: boolean; failed: boolean },
) => ({ ...comment, ...extra });

export const useComment = (post: string) => {
  const trpc = useTRPC();
  const [comments, setComments] = useState<Comment[]>([]);
  const { data, isFetching } = useQuery({
    refetchOnMount: true,
    ...trpc.post.comment.list.queryOptions({ filter: { post } }),
  });

  const addComment = useCallback(
    (comment: Comment) => {
      setComments((comments) => [
        ...comments,
        { ...comment, sent: true, failed: false },
      ]);
    },
    [setComments],
  );
  const updateComment = useCallback(
    ({ id, changes }: { id: string; changes: Partial<Comment> }) => {
      setComments((comments) => {
        const index = comments.findIndex((comment) => comment.id === id);
        if (index > -1) {
          const comment = comments[index];
          comments[index] = { ...comment, ...changes };
        }
        return comments;
      });
    },
    [setComments],
  );

  useEffect(() => {
    if (data)
      setComments(
        data.map((comment) => ({ ...comment, sent: true, failed: false })),
      );
  }, [data]);

  return {
    comments,
    setComments,
    isFetching,
    addComment,
    updateComment,
  };
};
