import clsx from "clsx";
import Color from "color";
import { useMemo, useRef } from "react";
import { type Pressable, Text, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";

import { Colors } from "../../constants";
import CheckboxInput from "../CheckboxInput";
import CrudListItemAction, {
  type CrudListItemActionProps,
} from "../CrudListItemAction";

type MealItemProps = {
  title: string;
  subtitle: string;
  selected: boolean;
  hideActions?: boolean;
} & React.ComponentProps<typeof Pressable> &
  CrudListItemActionProps;

export function MealItem({
  title,
  subtitle,
  selected,
  onEdit,
  onDelete,
  hideActions,
  ...props
}: MealItemProps) {
  const swipeableRef = useRef<SwipeableMethods>(null);
  const actionFn = useMemo(
    () =>
      CrudListItemAction({
        onEdit,
        onDelete,
        ref: swipeableRef,
        className: "h-16",
      }),
    [onDelete, onEdit],
  );
  const child = useMemo(
    () => (
      <View
        className={clsx(
          "h-16 flex-row items-center p-2 rounded-lg",
          props.className,
        )}
        style={[
          {
            backgroundColor: Color("white").alpha(0.1).hexa(),
            marginHorizontal: hideActions ? 16 : undefined,
          },
        ]}
      >
        <View className="flex-1">
          <Text className="text-white font-poppins-medium">{title}</Text>
          <Text
            className="text-sm text-white font-poppins"
            style={{ color: Colors.grey }}
          >
            {subtitle}
          </Text>
        </View>
        <CheckboxInput
          value={selected}
          onPress={props.onPress}
          className="z-0"
        />
      </View>
    ),
    [],
  );
  if (hideActions) return child;
  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      enableTrackpadTwoFingerGesture
      renderRightActions={actionFn}
      containerStyle={{ paddingHorizontal: 16 }}
    >
      {child}
    </ReanimatedSwipeable>
  );
}
