import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "../store";
import { useTRPCClient } from "../providers/TRPCProvider";
import { routineActions, routineSelector } from "../store/routine";

export default function useRoutine(id: string) {
  const trpc = useTRPCClient();
  const dispatch = useAppDispatch();
  const routineState = useAppSelector((state) => state.routine);
  const routine = routineSelector.selectById(routineState, id);

  useEffect(() => {
    if (routine) return;

    trpc.routine.retrieve
      .query({ id })
      .then((routine) => dispatch(routineActions.addRoutine(routine)));
  }, [routine]);

  return routine;
}
