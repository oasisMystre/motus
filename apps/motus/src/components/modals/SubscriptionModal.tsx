import clsx from "clsx";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "../Header";
import { Colors } from "../../constants";
import SubscriptionScreen from "../../screens/SubscriptionScreen";

type SubscriptionModalProps = {
  onRequestClose?: () => void;
} & React.ComponentProps<typeof Modal>;

export default function SubscriptionModal({
  ...props
}: SubscriptionModalProps) {
  const { top } = useSafeAreaInsets();
  return (
    <Modal
      {...props}
      animationType="slide"
      backdropColor={Colors.backgroundColor}
    >
      <View
        className={clsx("flex-1", props.className)}
        style={{
          paddingTop: top,
          paddingHorizontal: 16,
          backgroundColor: Colors.backgroundColor,
        }}
      >
        <View className="flex flex-row items-center">
          <Pressable>
            <BackButton
              canGoBack
              navigation={{
                goBack: (event) => {
                  if (event) props.onRequestClose?.(event);
                },
              }}
            />
          </Pressable>
          <Text className="flex-1 text-center text-white text-lg font-poppins-semibold">
            Subscription
          </Text>
        </View>
        <SubscriptionScreen />
      </View>
    </Modal>
  );
}
