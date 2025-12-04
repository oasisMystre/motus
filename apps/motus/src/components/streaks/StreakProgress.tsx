import { useMemo } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import CircleProgressBar from "../../assets/circle-progress-bar";

type StreakProgressProps = {
  goalSteps: number;
  currentSteps: number;
};

export function StreakProgress({
  currentSteps,
  goalSteps,
}: StreakProgressProps) {
  const progress = useMemo(
    () => (currentSteps / goalSteps) * 100,
    [currentSteps, goalSteps],
  );

  return (
    <View className="relative items-center justify-center">
      <CircleProgressBar
        size={234}
        percentage={progress}
        strokeWidth={6}
      />
      <View className="absolute items-center justify-center">
        <Ionicons
          size={28}
          color="white"
          name="footsteps-sharp"
        />
        <Text className="text-white/70 font-poppins">Steps today</Text>
        <Text className="text-2xl text-white font-poppins-bold">
          {currentSteps}
        </Text>
        <Text className="text-sm  font-poppins text-white/70">Daily goals</Text>
        <Text className="text-white font-poppins-bold">{goalSteps}</Text>
      </View>
    </View>
  );
}
