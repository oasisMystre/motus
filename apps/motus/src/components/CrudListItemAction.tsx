import { Pressable, Text } from "react-native";
import Reanimated from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { type SharedValue, useAnimatedStyle } from "react-native-reanimated";

export type CrudListItemActionProps = {
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function CrudListItemAction({
  onEdit,
  onDelete,
}: CrudListItemActionProps) {
  return (_progress: SharedValue<number>, drag: SharedValue<number>) => {
    const style = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 114 }],
      };
    });

    return (
      <Reanimated.View
        style={style}
        className="w-36 h-16 flex flex-row gap-x-2 z-50"
      >
        {onEdit && (
          <Pressable
            className="flex-1 flex flex-col items-center justify-center space-y-2 bg-stone-700 rounded-lg"
            onPress={onEdit}
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
            onPress={onDelete}
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
