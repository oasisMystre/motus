import { format } from "util";
import { Formik } from "formik";
import { Stack } from "expo-router";
import { useMutation } from "@tanstack/react-query";

import { BackButton } from "../../../../components/Header";
import { useTRPC } from "../../../../providers/TRPCProvider";
import { ScreenProvider } from "../../../../components/create-goal";

export default function CreateGoalLayout() {
  const trpc = useTRPC();
  const { mutateAsync } = useMutation(trpc.mcp.create.mutationOptions());

  return (
    <Formik
      initialValues={{}}
      onSubmit={async (data, { setStatus }) => {
        const message = format("%s update-goal", JSON.stringify(data));
        return mutateAsync({ message })
          .then(() => setStatus("successful"))
          .catch(() => setStatus(undefined));
      }}
    >
      {({ status, handleSubmit }) => (
        <ScreenProvider>
          <Stack
            screenOptions={({ navigation }) => ({
              title: "Goals",
              headerShown: false,
              animation: "slide_from_right",
              presentation: "fullScreenModal",
              headerLeft(props) {
                return (
                  <BackButton
                    {...props}
                    navigation={navigation}
                  />
                );
              },
              fullScreenGestureShadowEnabled: false,
              headerStyle: { backgroundColor: "transparent" },
              headerTitleStyle: { fontFamily: "Poppins_700Medium" },
            })}
          >
            <Stack.Screen
              name="index"
              listeners={{
                transitionEnd: () => {
                  if (status === "submit") setTimeout(() => handleSubmit());
                },
              }}
            />
            <Stack.Screen name="step-0" />
            <Stack.Screen
              name="(meal)/index"
              options={{ headerShown: true }}
            />
            <Stack.Screen name="(meal)/step-1" />
            <Stack.Screen
              name="(meal)/step-2"
              options={{ headerShown: true }}
            />
            <Stack.Screen name="(meal)/step-3" />
            <Stack.Screen
              name="(meal)/step-4"
              options={{ headerShown: true }}
            />
            <Stack.Screen
              name="(weight)/index"
              options={{ headerShown: true }}
            />
            <Stack.Screen name="(weight)/step-1" />
            <Stack.Screen
              name="(weight)/step-2"
              options={{ headerShown: true }}
            />
            <Stack.Screen
              name="(activity)/index"
              options={{ headerShown: true }}
            />
          </Stack>
        </ScreenProvider>
      )}
    </Formik>
  );
}
