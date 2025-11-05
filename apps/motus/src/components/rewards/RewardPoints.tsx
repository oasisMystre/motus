import { Text, View } from "react-native";
import { Colors } from "../../constants";

type RewardPointsProps = {
  points: number;
};

export function RewardPoints({ points }: RewardPointsProps) {
  return (
    <View className="items-center justify-center">
      <Text className="text-2xl text-white font-poppins-bold">
        {points} Motus
      </Text>
      <Text style={{ color: Colors.text[0] }}>Available points</Text>
    </View>
  );
}
