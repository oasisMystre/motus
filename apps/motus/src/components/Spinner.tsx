import { format } from "util";
import { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

import { Colors } from "../constants";

export default function Spinner({
  size = 72,
  strokeWidth = 10,
  duration = 2000,
}) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateValue, {
        duration,
        toValue: 1,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
    return () => rotateValue.stopAnimation();
  }, [rotateValue, duration]);

  const rotation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
      >
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#D9D9D9"
          strokeWidth={strokeWidth}
          fill="none"
        />
      </Svg>
      <Animated.View
        style={{
          width: size,
          height: size,
          position: "absolute",
          transform: [{ rotate: rotation }],
        }}
      >
        <Svg
          width={size}
          height={size}
        >
          <Defs>
            <LinearGradient
              id="conicGradient"
              x1="0%"
              y1="50%"
              x2="100%"
              y2="50%"
            >
              <Stop
                offset="0%"
                stopOpacity="1"
                stopColor={Colors.primary}
              />
              <Stop
                offset="25%"
                stopOpacity="0.8"
                stopColor={Colors.primary}
              />
              <Stop
                offset="50%"
                stopOpacity="0.4"
                stopColor={Colors.primary}
              />
              <Stop
                offset="75%"
                stopOpacity="0.1"
                stopColor={Colors.primary}
              />
              <Stop
                offset="100%"
                stopOpacity="0"
                stopColor={Colors.primary}
              />
            </LinearGradient>
          </Defs>

          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            stroke="url(#conicGradient)"
            strokeDasharray={format(
              "%d %d",
              circumference * 0.5,
              circumference * 0.5,
            )}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
