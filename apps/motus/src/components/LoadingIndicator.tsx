import type React from "react";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { Colors } from "../constants";

export default function TypingIndicator() {
  return (
    <View style={styles.container}>
      {Array.from({ length: 3 }).map((_, index) => (
        <Dot
          key={index}
          duration={400}
          delay={index * 200}
          style={styles.dot}
        />
      ))}
    </View>
  );
}

type DotProps = {
  delay: number;
  duration: number;
} & React.ComponentProps<typeof Animated.View>;

export const Dot = ({ delay, duration, ...props }: DotProps) => {
  const opacity = useSharedValue(1);
  const translation = useSharedValue(0);

  useEffect(() => {
    translation.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-duration / 100, {
            duration,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(duration / 1000, {
            duration,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, duration, translation, opacity]);

  const style = useAnimatedStyle(
    () => ({
      opacity: opacity.value,
      transform: [{ translateY: translation.value }],
    }),
    [opacity, translation, opacity],
  );

  return (
    <Animated.View
      {...props}
      style={[props.style, style]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
    padding: 8,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 100,
    backgroundColor: Colors.grey,
  },
});
