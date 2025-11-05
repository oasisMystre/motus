import "react-native-get-random-values";

import { useEffect } from "react";
import { useFonts } from "expo-font";
import { StatusBar } from "react-native";
import { isRunningInExpoGo } from "expo";
import * as Sentry from "@sentry/react-native";
import { preventAutoHideAsync } from "expo-splash-screen";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  DarkTheme,
  ThemeProvider,
  useNavigationContainerRef,
} from "@react-navigation/native";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  Poppins_100Thin,
  Poppins_100Thin_Italic,
  Poppins_200ExtraLight,
  Poppins_200ExtraLight_Italic,
  Poppins_300Light,
  Poppins_300Light_Italic,
  Poppins_400Regular,
  Poppins_400Regular_Italic,
  Poppins_500Medium,
  Poppins_500Medium_Italic,
  Poppins_600SemiBold,
  Poppins_600SemiBold_Italic,
  Poppins_700Bold,
  Poppins_700Bold_Italic,
  Poppins_800ExtraBold,
  Poppins_800ExtraBold_Italic,
  Poppins_900Black,
  Poppins_900Black_Italic,
} from "@expo-google-fonts/poppins";

import "../i18n";
import "../polyfill";
import "../global.css";
import Provider from "../providers";
import App from "../components/App";

preventAutoHideAsync();

configureReanimatedLogger({
  strict: false,
  level: ReanimatedLogLevel.warn,
});

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DNS,
  sendDefaultPii: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    navigationIntegration,
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],
  enableNativeFramesTracking: !isRunningInExpoGo(),
});

export default Sentry.wrap(function RootLayout() {
  const ref = useNavigationContainerRef();
  useEffect(() => {
    if (ref) navigationIntegration.registerNavigationContainer(ref);
  }, [ref]);

  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Poppins_100Thin,
    Poppins_100Thin_Italic,
    Poppins_200ExtraLight,
    Poppins_200ExtraLight_Italic,
    Poppins_300Light,
    Poppins_300Light_Italic,
    Poppins_400Regular,
    Poppins_400Regular_Italic,
    Poppins_500Medium,
    Poppins_500Medium_Italic,
    Poppins_600SemiBold,
    Poppins_600SemiBold_Italic,
    Poppins_700Bold,
    Poppins_700Bold_Italic,
    Poppins_800ExtraBold,
    Poppins_800ExtraBold_Italic,
    Poppins_900Black,
    Poppins_900Black_Italic,
  });

  return (
    <KeyboardProvider>
      <ThemeProvider value={DarkTheme}>
        <StatusBar />
        <Provider>
          <GestureHandlerRootView>
            <App />
          </GestureHandlerRootView>
        </Provider>
      </ThemeProvider>
    </KeyboardProvider>
  );
});
