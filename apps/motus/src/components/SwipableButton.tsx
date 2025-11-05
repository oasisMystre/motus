import Color from "color";
import { Text, type View } from "react-native";
import { Octicons } from "@expo/vector-icons";
import type React from "react";
import { useMemo, useState } from "react";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

import { Colors } from "../constants";

type SwipeAbleButtonProps = {
  onSwipeComplete?: () => void;
} & React.ComponentProps<typeof View>;

export function SwipeAbleButton({
  style,
  onSwipeComplete,
}: SwipeAbleButtonProps) {
  const knobSize = 56;
  const knobMargin = 8;
  const totalKnobWidth = knobSize + knobMargin * 2;

  const position = useSharedValue(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const threshold = useMemo(
    () => Math.max(containerWidth - totalKnobWidth, 0),
    [containerWidth],
  );

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      position.value = Math.min(Math.max(event.translationX, 0), threshold);
    })
    .onEnd(() => {
      const shouldComplete = position.value > threshold * 0.85;
      const destination = shouldComplete ? threshold : 0;
      position.value = withSpring(destination, { stiffness: 200, damping: 20 });

      if (shouldComplete && onSwipeComplete) runOnJS(onSwipeComplete)();
    });
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  const progressStyle = useAnimatedStyle(() => {
    const animatedEndRadius = interpolate(
      position.value,
      [threshold - 32, threshold],
      [0, 100],
      Extrapolation.CLAMP,
    );

    return {
      borderTopLeftRadius: 100,
      borderBottomLeftRadius: 100,
      width:
        position.value > totalKnobWidth / 2
          ? position.value + totalKnobWidth
          : 0,
      borderTopRightRadius: animatedEndRadius,
      borderBottomRightRadius: animatedEndRadius,
    };
  });

  const chevronStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      position.value,
      [0, threshold * 0.5],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      style={[
        style,
        {
          height: 72,
          borderRadius: 100,
          overflow: "hidden",
          flexDirection: "row",
          alignItems: "center",
          padding: knobMargin,
          backgroundColor: Color(Colors.primary).alpha(0.1).hexa(),
        },
      ]}
    >
      <Animated.View
        style={[
          progressStyle,
          {
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 10,
            position: "absolute",
            backgroundColor: Colors.primary,
          },
        ]}
      />
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            knobStyle,
            {
              width: knobSize,
              height: knobSize,
              borderRadius: 100,
              backgroundColor: "white",
              zIndex: 10,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <Octicons
            name="check"
            size={28}
          />
        </Animated.View>
      </GestureDetector>
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{
          flex: 1,
          color: "white",
          marginLeft: 16,
          fontFamily: "Poppins",
        }}
      >
        Swipe to get started
      </Text>

      <Animated.View
        style={[
          chevronStyle,
          {
            width: 64,
            position: "relative",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Octicons
          name="chevron-right"
          size={16}
          color={Colors.inputHighlightColor}
          style={{ position: "absolute", marginRight: -16 }}
        />
        <Octicons
          name="chevron-right"
          size={16}
          color={Color(Colors.inputHighlightColor).alpha(0.9).hexa()}
          style={{ position: "absolute", marginRight: 0 }}
        />
        <Octicons
          name="chevron-right"
          size={16}
          color={Color(Colors.inputHighlightColor).alpha(0.5).hexa()}
          style={{ position: "absolute", marginRight: 16 }}
        />
      </Animated.View>
    </Animated.View>
  );
}
