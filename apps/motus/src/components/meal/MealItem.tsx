import clsx from "clsx";
import Color from "color";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Colors } from "../../constants";
import CheckboxInput from "../CheckboxInput";

type MealItemProps = {
  title: string;
  subtitle: string;
  selected: boolean;
  onMenu?: () => void;
  hideActions?: boolean;
} & React.ComponentProps<typeof Pressable>;

export function MealItem({
  onMenu,
  title,
  subtitle,
  selected,
  hideActions,
  ...props
}: MealItemProps) {
  return (
    <View
      className={clsx(
        "flex-row items-center gap-x-2 p-2 rounded-lg",
        props.className,
      )}
      style={[
        {
          backgroundColor: Color("white").alpha(0.1).hexa(),
          marginHorizontal: hideActions ? 16 : undefined,
        },
      ]}
    >
      <CheckboxInput
        value={selected}
        onPress={props.onPress}
        className="z-0"
      />
      <View className="flex-1">
        <Text className="text-white font-poppins-medium">{title}</Text>
        <Text
          className="text-sm text-white font-poppins"
          style={{ color: Colors.grey }}
        >
          {subtitle}
        </Text>
      </View>
      {!hideActions && (
        <Pressable onPress={onMenu}>
          <MaterialIcons
            name="more-vert"
            color="white"
            size={18}
          />
        </Pressable>
      )}
    </View>
  );
}
