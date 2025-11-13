import type z from "zod";
import { useCallback } from "react";
import type { routineSelectSchema } from "@motus/server";
import type { InferDataFromTag, QueryClient } from "@tanstack/react-query";
import type { TRPCQueryKeyWithoutPrefix } from "@trpc/tanstack-react-query";

import { useTRPC } from "../providers/TRPCProvider";

export const useTanstackStore = <
  K extends TRPCQueryKeyWithoutPrefix,
  T extends InferDataFromTag<unknown, K> extends Array<unknown>
    ? InferDataFromTag<unknown, K>[number]
    : InferDataFromTag<unknown, K>,
  Fn extends (item: T) => unknown,
>(
  queryClient: QueryClient,
  key: K,
  getId?: Fn,
) => {
  const trpc = useTRPC();

  const add = useCallback(
    (data: T) => {
      queryClient.setQueryData(key, (previousData): any => {
        if (Array.isArray(previousData)) {
          if (previousData) return [data, ...previousData];
          return [data];
        }

        return previousData;
      });
    },
    [queryClient, key],
  );

  const update = useCallback(
    (data: T) => {
      queryClient.setQueryData(key, (previousData): any => {
        if (Array.isArray(previousData)) {
          if (previousData) {
            const index = previousData.findIndex(
              (item) => getId?.(item) === getId?.(data),
            );
            if (index > -1) {
              const newData = [...previousData];
              newData[index] = data;
              return newData;
            }

            return [data, ...previousData];
          }

          return [data];
        }

        return previousData;
      });
    },
    [queryClient, key],
  );

  const remove = useCallback(
    <T extends ReturnType<Exclude<typeof getId, undefined>>>(data: T) => {
      queryClient.setQueryData(key, (previousData): any => {
        if (Array.isArray(previousData)) {
          if (previousData)
            return previousData.filter((item) => getId?.(item) !== data);

          return [];
        }

        return previousData;
      });
    },
    [queryClient, key],
  );

  return { add, update, remove };
};
