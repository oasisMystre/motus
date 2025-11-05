import { useEffect, useState } from "react";
import { hideAsync } from "expo-splash-screen";
import * as Sentry from "@sentry/react-native";

import { useTRPCClient } from "./TRPCProvider";
import { useFirebase } from "./FirebaseProvider";
import { postActions } from "../store/post";
import { rewardActions } from "../store/reward";
import { streakActions } from "../store/streak";
import { routineActions } from "../store/routine";
import { metadataActions } from "../store/metadata";
import { exerciseActions } from "../store/exercise";
import { useAppDispatch, useAppSelector } from "../store";

export default function AppStateProvider({
  children,
}: React.PropsWithChildren) {
  const trpc = useTRPCClient();
  const { state } = useFirebase();
  const [render, setRender] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const dispatch = useAppDispatch();

  const fetchData = async () =>
    Promise.all([
      trpc.equipment.list
        .query()
        .then((equipments) =>
          dispatch(metadataActions.addEquipments(equipments)),
        ),
      trpc.exercise.list.query().then((exercises) => {
        dispatch(exerciseActions.addCustomExercises(exercises.custom));
        dispatch(exerciseActions.addExercises(exercises.default));
      }),
      trpc.muscle.list
        .query()
        .then((muscles) => dispatch(metadataActions.addMuscles(muscles))),
      trpc.reward.list
        .query()
        .then((rewards) => dispatch(rewardActions.addRewards(rewards))),
      trpc.reward.aggregrate
        .query()
        .then((extra) => dispatch(rewardActions.addExtra(extra))),
      trpc.streak.list
        .query()
        .then((streaks) => dispatch(streakActions.addStreaks(streaks))),
      trpc.streak.aggregate
        .query()
        .then((streak) => dispatch(streakActions.setLongestStreak(streak))),
      trpc.routine.list
        .query()
        .then((routines) => dispatch(routineActions.addRoutines(routines))),
      trpc.post.list
        .query()
        .then((posts) => dispatch(postActions.addPosts(posts))),
    ]);

  useEffect(() => {
    if (state === "completed") {
      hideAsync();
      setRender(true);
    }
  }, [state, user]);

  useEffect(() => {
    if (user?.type === "firebase") fetchData().catch(Sentry.captureException);
  }, [user?.type]);

  if (render) return children;
}
