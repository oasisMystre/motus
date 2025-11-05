import clsx from "clsx";
import Color from "color";
import { Pressable, Text, View } from "react-native";

import { Colors } from "../../constants";
import CheckboxInput from "../CheckboxInput";

type MealItemProps = {
  title: string;
  subtitle: string;
  selected: boolean;
} & React.ComponentProps<typeof Pressable>;

export function MealItem({
  title,
  subtitle,
  selected,
  ...props
}: MealItemProps) {
  return (
    <Pressable {...props}>
      <View
        className={clsx(
          "flex-row items-center p-2 rounded-xl",
          props.className,
        )}
        style={[{ backgroundColor: Color("white").alpha(0.1).hexa() }]}
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
        <CheckboxInput value={selected} />
      </View>
    </Pressable>
  );
}
