import { PrivyProvider } from "@privy-io/expo";
import { Provider as ReduxProvider } from "react-redux";

import { store } from "../store";
import TRPCProvider from "./TRPCProvider";
import SensorProvider from "./SensorProvider";
import LoadingProvider from "./LoadingProvider";
import AppStateProvider from "./AppStateProvider";
import FirebaseProvider from "./FirebaseProvider";
import SnackbarProvider from "./SnackbarProvider";

export default function Provider({ children }: React.PropsWithChildren) {
  return (
    <ReduxProvider store={store}>
      <PrivyProvider
        appId={process.env.EXPO_PRIVY_APP_ID}
        clientId={process.env.EXPO_PRIVY_CLIENT_ID}
      >
        <TRPCProvider>
          <FirebaseProvider>
            <AppStateProvider>
              <SnackbarProvider>
                <LoadingProvider>
                  {children}
                  <SensorProvider />
                </LoadingProvider>
              </SnackbarProvider>
            </AppStateProvider>
          </FirebaseProvider>
        </TRPCProvider>
      </PrivyProvider>
    </ReduxProvider>
  );
}

export { useLoading } from "./LoadingProvider";
export { useFirebase } from "./FirebaseProvider";
export { useSnackbar } from "./SnackbarProvider";
