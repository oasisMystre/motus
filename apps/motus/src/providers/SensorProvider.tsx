import moment from "moment";
import debounce from "lodash.debounce";
import { Platform } from "react-native";
import { Pedometer } from "expo-sensors";
import { useMutation } from "@tanstack/react-query";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useTRPC } from "./TRPCProvider";
import { useSnackbar } from "./SnackbarProvider";
import { useAppDispatch, useAppSelector } from "../store";
import { streakActions, streakSelectors } from "../store/streak";

export default function SensorProvider({ children }: React.PropsWithChildren) {
  const trpc = useTRPC();
  const toast = useSnackbar();
  const end = moment().endOf("day").toDate();
  const start = moment().startOf("day").toDate();
  const [permissionGranted, setPeromissionGranted] = useState(false);
  const [pedometerAvailable, setPedometerAvailable] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentSteps, ...streakState } = useAppSelector(
    (state) => state.streak,
  );

  const streaks = streakSelectors.selectAll(streakState);

  const { mutateAsync: createStreakMutateAsync } = useMutation(
    trpc.streak.create.mutationOptions({
      onSuccess(data) {
        dispatch(streakActions.addStreak(data));
      },
    }),
  );
  const { mutateAsync: updateStreakMutateAsync } = useMutation(
    trpc.streak.update.mutationOptions({
      onSuccess(data) {
        dispatch(streakActions.updateStreak({ id: data.id, changes: data }));
      },
    }),
  );

  const setUp = useCallback(async () => {
    const isAvailable = await Pedometer.isAvailableAsync();
    setPedometerAvailable(isAvailable);

    if (isAvailable) {
      const status = await Pedometer.getPermissionsAsync();
      setPeromissionGranted(status.granted);

      if (!status.granted || status.canAskAgain)
        Pedometer.requestPermissionsAsync().then((state) => {
          setPeromissionGranted(state.granted);
          if (state.status === "denied")
            toast.error({ text: "🔴 Please enable motion detection." });
        });
    }
  }, [
    toast,
    setPedometerAvailable,
    setPedometerAvailable,
    setPeromissionGranted,
  ]);

  const syncFn = useCallback(
    async (steps: number, start: Date, end: Date) => {
      if (user && user.type === "firebase") {
        const todayStreak = streaks.find(
          (streak) =>
            moment(streak.createdAt).isSameOrAfter(start) &&
            moment(streak.createdAt).isSameOrBefore(end),
        );

        if (todayStreak) updateStreakMutateAsync({ id: todayStreak.id, steps });
        else createStreakMutateAsync({ steps });
      }
    },
    [user, streaks, updateStreakMutateAsync, createStreakMutateAsync],
  );

  const sync = useMemo(() => debounce(syncFn), [syncFn]);

  useEffect(() => {
    setUp();
  }, []);

  useEffect(() => {
    if (pedometerAvailable)
      toast.success({ text: "🎉 This device can detect motion." });
  }, [pedometerAvailable]);

  useEffect(() => {
    if (Platform.OS === "ios")
      Pedometer.getStepCountAsync(start, end).then((result) => {
        dispatch(streakActions.setCurrentSteps(result.steps));
      });

    const subscription = Pedometer.watchStepCount((result) => {
      dispatch(streakActions.setCurrentSteps(result.steps));
    });

    return () => subscription.remove();
  }, [permissionGranted]);

  useEffect(() => {
    if (user && user.type === "firebase") sync(currentSteps, start, end);
  }, [currentSteps]);

  return children;
}
