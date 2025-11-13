import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "../providers/TRPCProvider";
import { useTanstackStore } from "./useTanstackStore";

export default function useRoutine(id: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const cache = useMemo(() => {
    const data = queryClient.getQueryData(trpc.routine.list.queryKey());
    return data?.find((data) => data.id === id);
  }, [queryClient, trpc]);

  const { update } = useTanstackStore(
    queryClient,
    trpc.routine.list.queryKey(),
  );
  const { data } = useQuery({
    initialData: cache,
    ...trpc.routine.retrieve.queryOptions({ id }),
  });

  useEffect(() => {
    if (data) return update(data);
  }, [data]);

  return data;
}
