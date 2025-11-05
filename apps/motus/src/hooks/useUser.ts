import { useQuery } from "@tanstack/react-query";

import { useAppSelector } from "../store";
import { useTRPCClient } from "../providers/TRPCProvider";

export function useUser(id: string) {
  const trpc = useTRPCClient();
  const { user } = useAppSelector((state) => state.auth);

  if (user && user.type === "firebase" && user.id === id) return user;

  const { data } = useQuery({
    queryKey: ["profile", id],
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: () => trpc.user.retrieve.query({ id }),
  });

  return data;
}
