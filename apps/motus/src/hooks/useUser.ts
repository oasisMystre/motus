import { useQuery } from "@tanstack/react-query";

import { useFirebase } from "../providers";
import { useTRPCClient } from "../providers/TRPCProvider";

export function useUser(id: string) {
  const trpc = useTRPCClient();
  const { user } = useFirebase();

  if (user?.id === id) return user;

  const { data } = useQuery({
    queryKey: ["profile", id],
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    queryFn: () => trpc.user.retrieve.query({ id }),
  });

  return data;
}
