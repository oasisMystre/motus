import type z from "zod";
import { setItemAsync } from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";
import type { userExtendSelectSchema } from "@motus/server";
import { getStorage } from "@react-native-firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  type FirebaseAuthTypes,
} from "@react-native-firebase/auth";

import "../firebase";
import type { NonNullable } from "../@types";
import { useTRPCClient, useTRPC } from "./TRPCProvider";

type User = z.infer<typeof userExtendSelectSchema>;

type FirebaseContext = {
  user: User | null;
  signIn: (user: FirebaseAuthTypes.User | null) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setAnonymousUser: React.Dispatch<
    React.SetStateAction<{ uid: string } | undefined>
  >;
  anonymousUser?: { uid: string };
  firebase: {
    auth: ReturnType<typeof getAuth>;
    storage: ReturnType<typeof getStorage>;
  };
  state:
    | "firebase.auth.idle"
    | "firebase.auth.initializing"
    | "firebase.auth.initialized";
};

export const FirebaseContext = createContext<FirebaseContext | null>(null);

export default function FirebaseProvider({
  children,
}: React.PropsWithChildren) {
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [anonymousUser, setAnonymousUser] = useState<{ uid: string }>();
  const [state, setState] =
    useState<FirebaseContext["state"]>("firebase.auth.idle");

  const auth = useMemo(() => getAuth(), []);
  const storage = useMemo(() => getStorage(), []);

  const fetchData = useCallback(
    async () =>
      Promise.all([
        queryClient.prefetchQuery(trpc.post.list.queryOptions()),
        queryClient.prefetchQuery(trpc.muscle.list.queryOptions()),
        queryClient.prefetchQuery(trpc.reward.list.queryOptions()),
        queryClient.prefetchQuery(trpc.streak.list.queryOptions()),
        queryClient.prefetchQuery(trpc.equipment.list.queryOptions()),
        queryClient.prefetchQuery(trpc.exercise.list.queryOptions()),
        queryClient.prefetchQuery(trpc.reward.aggregrate.queryOptions()),
        queryClient.prefetchQuery(trpc.streak.aggregate.queryOptions()),
      ]),
    [queryClient],
  );

  const signIn = useCallback(
    async (firebaseUser: FirebaseAuthTypes.User | null) => {
      setState("firebase.auth.initializing");

      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        await setItemAsync("firebase.token", idToken);

        const [, user] = await Promise.all([
          fetchData().catch(() => null),
          trpcClient.user.retrieve.query().catch(() => null),
        ]);
        if (user) {
          if (user.token) await setItemAsync("firebase.session", user.token);
          setUser(user);
        }
      } else {
        const uid = await AsyncStorage.getItem("anonymous_user");
        if (uid) setAnonymousUser({ uid });
      }

      setState("firebase.auth.initialized");
    },
    [],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, signIn);
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider
      value={{
        user,
        setUser,
        state,
        signIn,
        anonymousUser,
        setAnonymousUser,
        firebase: { auth, storage },
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () =>
  useContext(FirebaseContext) as NonNullable<FirebaseContext>;
