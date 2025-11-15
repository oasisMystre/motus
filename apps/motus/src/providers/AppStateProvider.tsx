import { useEffect, useState } from "react";
import { hideAsync } from "expo-splash-screen";
import * as Sentry from "@sentry/react-native";
import { useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "./TRPCProvider";
import { useFirebase } from "./FirebaseProvider";

export default function AppStateProvider({
  children,
}: React.PropsWithChildren) {
  const trpc = useTRPC();
  const { user, state } = useFirebase();
  const queryClient = useQueryClient();

  const [render, setRender] = useState(false);

  const fetchData = async () =>
    Promise.all([
      queryClient.prefetchQuery(trpc.post.list.queryOptions()),
      queryClient.prefetchQuery(trpc.muscle.list.queryOptions()),
      queryClient.prefetchQuery(trpc.reward.list.queryOptions()),
      queryClient.prefetchQuery(trpc.streak.list.queryOptions()),
      queryClient.prefetchQuery(trpc.equipment.list.queryOptions()),
      queryClient.prefetchQuery(trpc.exercise.list.queryOptions()),
      queryClient.prefetchQuery(trpc.reward.aggregrate.queryOptions()),
      queryClient.prefetchQuery(trpc.streak.aggregate.queryOptions()),
    ]);

  useEffect(() => {
    const render = () => {
      setRender(true);
      hideAsync();
    };

    if (state === "firebase.auth.initialized") {
      if (user) fetchData().catch(Sentry.captureException).finally(render);
      else render();
    }
  }, [state, user]);

  useEffect(() => {}, [user]);

  if (render) return children;
}
