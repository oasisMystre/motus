import type z from "zod";
import * as Sentry from "@sentry/react-native";
import { setItemAsync } from "expo-secure-store";
import type { userExtendSelectSchema } from "@motus/server";
import { getStorage } from "@react-native-firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import "../firebase";
import type { NonNullable } from "../@types";
import { useTRPCClient } from "./TRPCProvider";

type User = z.infer<typeof userExtendSelectSchema>;

type FirebaseContext = {
  user: User | null;
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
  const trpc = useTRPCClient();
  const [user, setUser] = useState<User | null>(null);
  const [anonymousUser, setAnonymousUser] = useState<{ uid: string }>();
  const [state, setState] =
    useState<FirebaseContext["state"]>("firebase.auth.idle");

  const auth = useMemo(() => getAuth(), []);
  const storage = useMemo(() => getStorage(), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setState("firebase.auth.initializing");

      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        await setItemAsync("firebase.token", idToken);

        const user = await trpc.user.retrieve.query().catch((error) => {
          Sentry.captureException(error);
          return null;
        });
        if (user) {
          if (user.token) await setItemAsync("firebase.session", user.token);
          setUser(user);
        }
      } else {
        const uid = await AsyncStorage.getItem("anonymous_user");
        if (uid) setAnonymousUser({ uid });
      }

      setState("firebase.auth.initialized");
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider
      value={{
        user,
        setUser,
        setAnonymousUser,
        state,
        anonymousUser,
        firebase: { auth, storage },
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () =>
  useContext(FirebaseContext) as NonNullable<FirebaseContext>;
