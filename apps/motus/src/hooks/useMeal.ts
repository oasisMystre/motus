import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "../providers/TRPCProvider";
import { useAppDispatch, useAppSelector } from "../store";
import { logActions, mealLogSelector } from "../store/log";

export const useMeal = (id?: string) => {
  if (id) {
    const trpc = useTRPC();
    const dispatch = useAppDispatch();
    const mealState = useAppSelector((state) => state.log.meal);
    const meal = mealLogSelector.selectById(mealState, id);

    if (meal) return meal;

    const { data } = useQuery(trpc.log.meal.retrieve.queryOptions({ id }));

    useEffect(() => {
      if (data) dispatch(logActions.addMealLog(data));
    }, [data]);

    return meal;
  }

  return null;
};
