import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "../providers/TRPCProvider";

export const useReward = () => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.reward.aggregrate.queryOptions());

  return data!;
};
