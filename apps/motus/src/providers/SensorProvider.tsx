import moment from "moment";
import type React from "react";
import debounce from "lodash.debounce";
import { Platform } from "react-native";
import { Pedometer } from "expo-sensors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useTRPC } from "./TRPCProvider";
import { useSnackbar } from "./SnackbarProvider";
import { useFirebase } from "./FirebaseProvider";
import { useTanstackStore } from "../hooks/useTanstackStore";

type SensorContext = {
  currentSteps: number;
};
export const SensorContext = createContext({
  currentSteps: 0,
});

export default function SensorProvider({ children }: React.PropsWithChildren) {
  const trpc = useTRPC();
  const toast = useSnackbar();
  const { user } = useFirebase();
  const queryClient = useQueryClient();

  const [currentSteps, setCurrentSteps] = useState(0);
  const [permissionGranted, setPeromissionGranted] = useState(false);
  const [pedometerAvailable, setPedometerAvailable] = useState<boolean>(false);

  const end = useMemo(() => moment().endOf("day").toDate(), []);
  const start = useMemo(() => moment().startOf("day").toDate(), []);

  const { data: streaks = [] } = useQuery(trpc.streak.list.queryOptions());
  const { update } = useTanstackStore(
    queryClient,
    trpc.streak.list.queryKey(),
    (streak) => streak.id,
  );

  const { mutateAsync: createStreakMutateAsync } = useMutation(
    trpc.streak.create.mutationOptions({
      onSuccess(data) {
        update(data);
      },
    }),
  );
  const { mutateAsync: updateStreakMutateAsync } = useMutation(
    trpc.streak.update.mutationOptions({
      onSuccess(data) {
        update(data);
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
  }, [toast]);

  const syncFn = useCallback(
    async (steps: number, start: Date, end: Date) => {
      if (user) {
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
  }, [setUp]);

  useEffect(() => {
    if (pedometerAvailable) {
      if (Platform.OS === "ios")
        Pedometer.getStepCountAsync(start, end).then((result) =>
          setCurrentSteps(result.steps),
        );

      const subscription = Pedometer.watchStepCount((result) =>
        setCurrentSteps(result.steps),
      );

      return () => subscription.remove();
    }
  }, [pedometerAvailable, start, end]);

  useEffect(() => {
    if (user) sync(currentSteps, start, end);
  }, [user, start, end, currentSteps, sync]);

  return (
    <SensorContext.Provider value={{ currentSteps }}>
      {children}
    </SensorContext.Provider>
  );
}

export const useSensor = () => useContext(SensorContext);
