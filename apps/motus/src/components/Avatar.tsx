import clsx from "clsx";
import { Image } from "expo-image";
import { View } from "react-native";
import { BarbellIcon } from "phosphor-react-native";

import { Colors } from "../constants";

type AvatarProps = {
  url?: string | null;
  size?: number;
  color?: string;
} & React.ComponentProps<typeof View> &
  Omit<React.ComponentProps<typeof Image>, "source">;

export default function Avatar({
  url,
  size = 32,
  color,
  ...props
}: AvatarProps) {
  return url ? (
    <Image
      {...props}
      source={{ uri: url }}
      className={clsx("size-16 rounded-full", props.className)}
    />
  ) : (
    <View
      {...props}
      style={[{ backgroundColor: Colors.darkGray }, props.style]}
      className={clsx(
        "size-16 items-center justify-center rounded-full",
        props.className,
      )}
    >
      <BarbellIcon
        size={size}
        weight="duotone"
        color={color ? color : Colors.grey}
        style={{ transform: [{ rotate: "30deg" }] }}
      />
    </View>
  );
}
