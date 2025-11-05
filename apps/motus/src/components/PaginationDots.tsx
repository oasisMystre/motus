import { Animated, View } from "react-native";

import { Colors } from "../constants";

type PaginationDotsProps = {
  length: number;
  currentIndex: number;
  scrollX: Animated.Value;
} & React.ComponentProps<typeof View>;

export function PaginationDots({
  length,
  currentIndex,
  style,
  scrollX,
}: PaginationDotsProps) {
  return (
    <View
      style={Object.assign(style ? style : {}, {
        gap: 8,
        flexDirection: "row",
        justifyContent: "center",
      })}
    >
      {Array.from({ length }).map((_, index) => {
        const active = currentIndex === index;
        const width = scrollX.interpolate({
          extrapolate: "clamp",
          outputRange: [8, 20, 8],
          inputRange: [(index - 1) * 390, index * 390, (index + 1) * 390],
        });

        return (
          <Animated.View
            key={index}
            style={{
              width,
              height: 8,
              borderRadius: 8,
              backgroundColor: active ? Colors.primary : Colors.outline,
            }}
          />
        );
      })}
    </View>
  );
}
