import clsx from "clsx";
import { TouchableWithoutFeedback, View } from "react-native";
import {
  Modal,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Colors } from "../../constants";

type ModalDialogProps = {
  containerStyle?: StyleProp<ViewStyle>;
  containerClassName?: string;
  onRequestClose: (ev?: NativeSyntheticEvent<any>) => void;
} & Omit<
  React.ComponentProps<typeof Modal>,
  "animationType" | "transparent" | "onRequestClose"
>;

export default function ModalDialog({
  children,
  containerStyle,
  containerClassName,
  ...props
}: React.PropsWithChildren<ModalDialogProps>) {
  return (
    <Modal
      {...props}
      animationType="slide"
      transparent
    >
      <View className="flex-1">
        <TouchableWithoutFeedback
          onPress={(event) => props.onRequestClose?.(event)}
        >
          <View className="absolute inset-0 bg-black/50" />
        </TouchableWithoutFeedback>
        <View
          className={clsx(
            "w-full mt-auto rounded-t-xl",
            containerClassName ?? "h-3/4",
          )}
          style={[{ backgroundColor: Colors.background[4] }, containerStyle]}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}
