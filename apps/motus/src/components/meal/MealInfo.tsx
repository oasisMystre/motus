import "react-native-reanimated";
import { Text, View } from "react-native";
import { VictoryPie } from "victory-native";

import { Colors } from "../../constants";
import type { getMealInfo } from "../../utils/get-meal-info";

const importantFacts = [
  { key: "proteins", color: Colors.green[0], atwaterFactor: 4 },
  { key: "carbohydrates", color: Colors.primary, atwaterFactor: 4 },
  { key: "fats", color: Colors.blue[0], atwaterFactor: 9 },
] as const;

type MealInfoProps = {
  info: ReturnType<typeof getMealInfo>;
};

export function MealInfo({ info }: MealInfoProps) {
  const data = importantFacts.map(({ key, color, atwaterFactor }) => {
    const nutriment = info[key];
    const percentage =
      ((nutriment.value * atwaterFactor) / info.energy.value) * 100;
    return {
      color,
      percentage,
      label: key,
      unit: nutriment.unit,
      value: nutriment.value,
    };
  });

  return (
    <View className="flex-row gap-x-4 items-center">
      <View
        className="items-center justify-center"
        style={{ width: 96, height: 96 }}
      >
        <VictoryPie
          data={data}
          x="label"
          y="percentage"
          width={96}
          height={96}
          radius={48}
          innerRadius={28}
          labels={({ datum }) => datum.label}
          colorScale={data.map((data) => data.color)}
        />
        <View
          className="items-center justify-center"
          style={{
            position: "absolute",
            width: 96 - 96 * 0.2,
            height: 96 - 96 * 0.2,
            backgroundColor: "white",
            borderRadius: 100,
          }}
        >
          <Text className="text-xl font-poppins">{info.energy.value}</Text>
          <Text className="text-xl font-poppins-bold">{info.energy.unit}</Text>
        </View>
      </View>
      <View className="flex-1 flex-row gap-x-8">
        {importantFacts.map(({ key, color }, index) => {
          const nutriment = data.find((data) => data.label === key);

          return (
            nutriment && (
              <View
                key={index}
                className="flex-1 items-center justify-center"
              >
                <Text
                  className="font-poppins"
                  style={{ color }}
                >
                  {nutriment.percentage.toFixed(2)}%
                </Text>
                <Text className="text-white font-poppins">
                  {nutriment.value.toFixed(2)}
                  {nutriment.unit}
                </Text>
                <Text
                  className="capitalize font-poppins truncate"
                  numberOfLines={1}
                  style={{ color: Colors.grey }}
                >
                  {key}
                </Text>
              </View>
            )
          );
        })}
      </View>
    </View>
  );
}
