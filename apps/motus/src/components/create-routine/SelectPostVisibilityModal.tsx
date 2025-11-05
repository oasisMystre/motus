import type z from "zod";
import Color from "color";
import type { postSelectSchema } from "@motus/server";
import { CheckIcon } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { Colors } from "../../constants";

type SelectPostVisibilityModalProps = {
  value: z.infer<typeof postSelectSchema>["visibility"];
  onChange: (value: z.infer<typeof postSelectSchema>["visibility"]) => void;
} & Omit<React.ComponentProps<typeof BottomSheet>, "children">;

export function SelectPostVisibilityModal({
  value,
  onChange,
  ...props
}: SelectPostVisibilityModalProps) {
  const { bottom } = useSafeAreaInsets();

  const items: {
    title: string;
    description: string;
    value: z.infer<typeof postSelectSchema>["visibility"];
  }[] = [
    {
      title: "Everyone",
      value: "everyone",
      description: "This workout is publicly available to all users on Motus.",
    },
    {
      title: "Private",
      value: "private",
      description:
        "Keep this workout private and visible only to you for personal use.",
    },
    {
      title: "Sensitive",
      value: "sensitive",
      description: "Hide my personal data like heart rate & calories",
    },
  ];

  return (
    <BottomSheet
      enablePanDownToClose
      enableOverDrag={false}
      snapPoints={["60%"]}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
      backgroundStyle={{ backgroundColor: Colors.background[3] }}
      handleIndicatorStyle={{ backgroundColor: Colors.grey, width: 64 }}
      {...props}
    >
      <BottomSheetView
        className="flex-1 gap-y-4"
        style={{ paddingBottom: bottom, paddingHorizontal: 16 }}
      >
        <Text
          className="text-lg font-poppins"
          style={{ color: Colors.grey }}
        >
          Workout Visibility
        </Text>
        <BottomSheetFlatList
          style={{ flex: 1 }}
          data={items}
          scrollEnabled={false}
          ItemSeparatorComponent={() => (
            <View style={{ height: 0.5, backgroundColor: Colors.border[0] }} />
          )}
          contentContainerStyle={{
            borderRadius: 8,
            backgroundColor: Color("white").alpha(0.05).hexa(),
          }}
          renderItem={({ item }) => {
            const selected = value === item.value;

            return (
              <Pressable
                className="flex-row items-center gap-x-4 p-4"
                onPress={() => {
                  onChange(item.value);
                  props.onClose?.();
                }}
              >
                <View className="flex-1">
                  <Text className="font-poppins-medium text-white">
                    {item.title}
                  </Text>
                  <Text
                    className="text-sm font-poppins"
                    style={{ color: Colors.grey }}
                  >
                    {item.description}
                  </Text>
                </View>
                <CheckIcon
                  color={Colors.primary}
                  style={{ opacity: selected ? 1 : 0 }}
                />
              </Pressable>
            );
          }}
        />
      </BottomSheetView>
    </BottomSheet>
  );
}
