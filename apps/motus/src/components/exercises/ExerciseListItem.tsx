import type z from "zod";
import { useMemo } from "react";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { BarbellIcon } from "phosphor-react-native";
import type { exerciseSelectSchema } from "@motus/server";
import {
  Pressable,
  View,
  Text,
  type GestureResponderEvent,
} from "react-native";

import { Colors } from "../../constants";

type ExerciseListItemProps = {
  index: number;
  size: number;
  custom?: boolean;
  replace?: boolean;
  onMenu: () => void;
  value: z.infer<typeof exerciseSelectSchema>;
  values: z.infer<typeof exerciseSelectSchema>[];
  onPress: (event: GestureResponderEvent, selected: boolean) => void;
};

export default function ExerciseListItem({
  size,
  index,
  replace,
  value,
  values,
  custom,
  onPress,
  onMenu,
}: ExerciseListItemProps) {
  const selected = useMemo(
    () => Boolean(values.find((exercise) => exercise.id === value.id)),
    [values, value],
  );
  const exists = useMemo(() => replace && selected, [replace, selected]);
  if (exists) return null;

  const containerStyle = useMemo(
    () => [
      {
        paddingVertical: 8,
        borderStartWidth: 4,
        borderBottomWidth: 1,
        borderStartColor: "transparent",
        borderColor:
          size > 0 && index < size - 1 ? Colors.border[1] : undefined,
      },
      selected &&
        !replace && [
          {
            borderStartWidth: 4,
            borderStartColor: Colors.primary,
          },
        ],
    ],
    [index, size, replace, selected],
  );

  return (
    <Pressable
      className="flex-row items-center gap-x-4 pr-2"
      style={containerStyle}
      onPress={(event) => onPress(event, selected)}
    >
      {value.image ? (
        <Image
          source={{ uri: value.image }}
          contentFit="cover"
          style={{ width: 56, height: 56, borderRadius: 100 }}
        />
      ) : (
        <View
          className="size-16 items-center justify-center rounded-full"
          style={{ backgroundColor: Colors.darkGray }}
        >
          <BarbellIcon
            size={32}
            color={Colors.grey}
            weight="duotone"
            style={{ transform: [{ rotate: "24deg" }] }}
          />
        </View>
      )}
      <View className="flex-1 flex flex-col">
        <Text className="text-lg text-white font-poppins-medium">
          {value.name}
        </Text>
        <View className="flex-row items-center gap-x-2">
          {[value.primary_muscle_group, ...value.other_muscles].map(
            (muscle, index) => (
              <Text
                key={index}
                style={{ color: Colors.grey }}
              >
                {muscle.name}
              </Text>
            ),
          )}
          {custom && (
            <View
              className="px-2 py-1 rounded-md"
              style={{ backgroundColor: Colors.background[3] }}
            >
              <Text style={{ color: Colors.grey }}>Custom</Text>
            </View>
          )}
        </View>
      </View>
      {custom && (
        <Pressable onPress={onMenu}>
          <MaterialIcons
            name="more-vert"
            color="white"
            size={18}
          />
        </Pressable>
      )}
    </Pressable>
  );
}
