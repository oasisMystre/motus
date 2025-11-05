import type z from "zod";
import Color from "color";
import moment from "moment";
import { format } from "util";
import type { mealLogSelectSchema } from "@motus/server";
import { Pressable, Text, View } from "react-native";
import { DotsThreeIcon } from "phosphor-react-native";

import Avatar from "../Avatar";
import { Colors } from "../../constants";

type MealLogmealProps = {
  meal: z.infer<typeof mealLogSelectSchema>;
  onMenu?: () => void;
};

export const MealLogItem = ({ meal, onMenu }: MealLogmealProps) => (
  <View
    className="flex-row  gap-x-2 p-2 rounded-md"
    style={{ backgroundColor: Color("white").alpha(0.1).hexa() }}
  >
    <Avatar
      url={meal.image}
      style={{
        borderRadius: 8,
      }}
    />
    <View className="flex-1 justify-center">
      <Text className="font-poppins-medium text-white">{meal.name}</Text>
      <Text
        className="text-sm font-poppins"
        style={{ color: Colors.grey }}
      >
        {format(
          "Carbs %d%s, Fat %d%s, Protein %d%s",
          meal.metadata.carbohydrates.value.toFixed(2),
          meal.metadata.carbohydrates.unit,
          meal.metadata.fats.value.toFixed(2),
          meal.metadata.fats.unit,
          meal.metadata.proteins.value.toFixed(2),
          meal.metadata.proteins.unit,
        )}
      </Text>
    </View>
    <View className="items-end">
      <Pressable
        onPress={onMenu}
        className="py-1"
      >
        <DotsThreeIcon color="white" />
      </Pressable>
      <Text
        className="text-sm"
        style={{ color: Colors.grey }}
      >
        {moment(meal.createdAt).fromNow()}
      </Text>
    </View>
  </View>
);
