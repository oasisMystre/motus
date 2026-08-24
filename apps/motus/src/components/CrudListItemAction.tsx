import type { RefObject } from "react";
import { Pressable, Text } from "react-native";
import Reanimated from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import type { SwipeableMethods } from "react-native-gesture-handler/lib/typescript/components/ReanimatedSwipeable";
import { type SharedValue, useAnimatedStyle } from "react-native-reanimated";
import clsx from "clsx";

export type CrudListItemActionProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  ref?: RefObject<SwipeableMethods | null>;
} & React.ComponentProps<typeof Reanimated.View>;

export default function CrudListItemAction({
  ref,
  onEdit,
  onDelete,
  ...props
}: CrudListItemActionProps) {
  return (_progress: SharedValue<number>, drag: SharedValue<number>) => {
    const style = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 114 }],
      };
    });

    return (
      <Reanimated.View
        {...props}
        style={[style, props.style]}
        className={clsx("w-36 flex flex-row gap-x-2 z-50 p-4", props.className)}
      >
        {onEdit && (
          <Pressable
            className="flex-1 flex flex-col items-center justify-center space-y-2 bg-stone-700 rounded-lg"
            onPress={() => {
              onEdit();
              ref?.current?.close();
            }}
          >
            <MaterialIcons
              name="edit"
              color="white"
              size={32}
            />
            <Text className="text-white font-poppins">Edit</Text>
          </Pressable>
        )}
        {onDelete && (
          <Pressable
            className="flex-1 flex items-center justify-center space-y-2 bg-red-500 rounded-lg"
            onPress={() => {
              onDelete();
              ref?.current?.close();
            }}
          >
            <MaterialIcons
              name="delete"
              color="white"
              size={32}
            />
            <Text className="text-white font-poppins">Delete</Text>
          </Pressable>
        )}
      </Reanimated.View>
    );
  };
}
