import * as Sentry from "@sentry/react-native";
import { setItemAsync } from "expo-secure-store";
import { getStorage } from "@react-native-firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import "../firebase";
import { useAppDispatch } from "../store";
import { authActions } from "../store/auth";
import { useTRPCClient } from "./TRPCProvider";

type FirebaseContext = {
  firebase: {
    auth: ReturnType<typeof getAuth>;
    storage: ReturnType<typeof getStorage>;
  };
  state: "idle" | "initializing" | "completed";
};

export const FirebaseContext = createContext<FirebaseContext | null>(null);

export default function FirebaseProvider({
  children,
}: React.PropsWithChildren) {
  const trpc = useTRPCClient();
  const auth = useRef(getAuth());
  const storage = useRef(getStorage());
  const [state, setState] = useState<FirebaseContext["state"]>("idle");

  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth.current,
      async (firebaseUser) => {
        setState("initializing");

        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          await setItemAsync("firebase.token", idToken);

          const user = await trpc.user.retrieve.query().catch((error) => {
            Sentry.captureException(error);
            return null;
          });
          if (user) {
            if (user.token) await setItemAsync("firebase.session", user.token);

            dispatch(
              authActions.setUser({
                ...user,
                type: firebaseUser.isAnonymous ? "anonymous" : "firebase",
              }),
            );
          }
        } else {
          const uid = await AsyncStorage.getItem("anonymous_user");
          dispatch(authActions.setUser({ type: "anonymous", uid }));
        }

        setState("completed");
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider
      value={{
        firebase: { auth: auth.current, storage: storage.current },
        state,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => useContext(FirebaseContext) as FirebaseContext;
