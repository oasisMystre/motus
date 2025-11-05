import clsx from "clsx";
import type React from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function KeyboardView({
  children,
  ...props
}: React.PropsWithChildren<React.ComponentProps<typeof KeyboardAvoidingView>>) {
  const { bottom } = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={bottom + bottom}
      {...props}
      className={
        props.className ? clsx("flex-1", props.className) : "flex-1 px-6"
      }
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {children}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
