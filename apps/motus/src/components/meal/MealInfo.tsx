import "react-native-reanimated";
import { Text, View } from "react-native";
import { VictoryPie } from "victory-native";

import { Colors } from "../../constants";

const important_fact_keys = [
  { key: "proteins", color: Colors.green[0], atwaterFactor: 4 },
  { key: "carbohydrates", color: Colors.primary, atwaterFactor: 4 },
  { key: "fats", color: Colors.blue[0], atwaterFactor: 9 },
] as const;

type MealInfoProps = {
  info: Record<
    (typeof important_fact_keys)[number]["key"],
    {
      value: number;
      unit: string;
    }
  >;
  energy: { value: number; unit: string };
};

export function MealInfo({ info, energy }: MealInfoProps) {
  const data = important_fact_keys
    .map(({ key, color, atwaterFactor }) => {
      const value = info[key];
      if (value) {
        const percentage = ((value.value * atwaterFactor) / energy.value) * 100;
        return {
          color,
          percentage,
          label: key,
          unit: value.unit,
          value: value.value * atwaterFactor,
        };
      }
      return null;
    })
    .filter(Boolean) as {
    label: string;
    color: string;
    value: number;
    unit: string;
    percentage: number;
  }[];

  return (
    <View className="flex-row gap-x-8 items-center">
      <View
        className="items-center justify-center"
        style={{ width: 96, height: 96 }}
      >
        <VictoryPie
          data={data}
          x="label"
          y="percentage"
          colorScale={data.map((data) => data.color)}
          labels={({ datum }) => datum.label}
          width={96}
          height={96}
          radius={48}
          innerRadius={28}
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
          <Text className="text-xl font-poppins">{energy.value}</Text>
          <Text className="text-xl font-poppins-bold">{energy.unit}</Text>
        </View>
      </View>
      <View className="flex-1 flex-row gap-x-8">
        {important_fact_keys.map(({ key, color }, index) => {
          const value = data.find((data) => data.label === key);

          return (
            value && (
              <View
                key={index}
                className="flex-1 items-center justify-center"
              >
                <Text
                  className="font-poppins"
                  style={{ color }}
                >
                  {value.percentage.toFixed(2)}%
                </Text>
                <Text className="text-white font-poppins">
                  {value.value.toFixed(2)}
                  {value.unit}
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
