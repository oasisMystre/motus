import type z from "zod";
import { useMemo, useRef } from "react";
import { BarbellIcon } from "phosphor-react-native";
import type { exerciseSelectSchema } from "@motus/server";
import {
  Pressable,
  View,
  Text,
  type GestureResponderEvent,
} from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";

import { Colors } from "../../constants";
import CrudListItemAction from "../CrudListItemAction";

type ExerciseListItemProps = {
  index: number;
  size: number;
  custom?: boolean;
  replace?: boolean;
  onEdit: () => void;
  onDelete: () => void;
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
  onEdit,
  onDelete,
  onPress,
}: ExerciseListItemProps) {
  const swipeableRef = useRef<SwipeableMethods | null>(null);
  const actionFn = useMemo(
    () =>
      CrudListItemAction({
        onEdit,
        onDelete,
        ref: swipeableRef,
      }),
    [onEdit, onDelete],
  );

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
        borderBottomWidth: 1,
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
    [size, replace, selected],
  );

  const child = useMemo(
    () => (
      <Pressable
        className="flex-row gap-x-4 px-2"
        style={custom ? undefined : containerStyle}
        onPress={(event) => onPress(event, selected)}
      >
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
        <View className="">
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
      </Pressable>
    ),
    [onPress, value, replace, selected],
  );

  return custom ? (
    <ReanimatedSwipeable
      ref={swipeableRef}
      enableTrackpadTwoFingerGesture
      renderRightActions={actionFn}
      containerStyle={containerStyle}
    >
      {child}
    </ReanimatedSwipeable>
  ) : (
    child
  );
}
