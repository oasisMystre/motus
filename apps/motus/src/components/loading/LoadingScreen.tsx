import clsx from "clsx";
import { Modal, Text, View } from "react-native";

import Spinner from "../Spinner";

type LoadingScreenProps = {
  title?: string;
  subtitle?: string;
  child?: React.ReactNode;
} & React.ComponentProps<typeof Modal>;

export default function LoadingScreen({
  title,
  subtitle,
  child,
  ...props
}: LoadingScreenProps) {
  return (
    <Modal {...props}>
      <View
        className={clsx(
          "flex-1 absolute inset-0 z-40 items-center justify-center gap-y-4",
          props.className,
        )}
      >
        {child ? (
          child
        ) : (
          <>
            <View>
              {title && (
                <Text className="text-white text-center text-2xl font-poppins-semibold">
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text className="text-white text-center font-poppins">
                  {subtitle}
                </Text>
              )}
            </View>
            <Spinner />
          </>
        )}
      </View>
    </Modal>
  );
}
