import type z from "zod";
import clsx from "clsx";
import { router } from "expo-router";
import type { exerciseSelectSchema } from "@motus/server";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ArrowClockwiseIcon, type Icon } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Pressable,
  type StyleProp,
  Text,
  type TextStyle,
  View,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlashList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { Colors } from "../../constants";
import { useAppDispatch } from "../../store";

export default function ExerciseMenuModal({
  exercise,
  removeExercise,
  ...props
}: Omit<React.ComponentProps<typeof BottomSheet>, "children"> & {
  exercise: z.infer<typeof exerciseSelectSchema>;
  removeExercise: (id: string) => void;
}) {
  const dispatch = useAppDispatch();
  const { bottom } = useSafeAreaInsets();

  const menuItems: {
    icon?: Icon;
    name: string;
    onPress?: () => void;
    textStyle?: StyleProp<TextStyle>;
  }[] = [
    {
      icon: ArrowClockwiseIcon,
      name: "Replace Exercise",
      onPress() {
        router.push(
          "/(tabs)/(log)/(create-workout)/(create-routine)/(add-exercise)",
        );
        props.onClose?.();
      },
    },
    {
      icon: (props) => (
        <MaterialCommunityIcons
          name="delete-outline"
          size={Number(props.size)}
          color={Colors.red[2]}
        />
      ),
      name: "Remove Exercise",
      textStyle: { color: Colors.red[2] },
      onPress() {
        removeExercise(exercise.id);
        props.onClose?.();
      },
    },
  ];

  return (
    <BottomSheet
      enablePanDownToClose
      enableOverDrag={false}
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
      <BottomSheetView style={{ paddingBottom: bottom }}>
        <BottomSheetFlashList
          data={menuItems}
          scrollEnabled={false}
          ItemSeparatorComponent={() => (
            <View style={{ height: 0.5, backgroundColor: Colors.border[1] }} />
          )}
          renderItem={({ item, index }) => (
            <Pressable
              className={clsx(
                "flex-row items-center gap-x-2 p-4",
                index === menuItems.length - 1 && "pb-16",
              )}
              onPress={item.onPress}
            >
              {item.icon && (
                <item.icon
                  color="white"
                  size={18}
                />
              )}
              <Text
                style={item.textStyle}
                className="text-white font-poppins-medium"
              >
                {item.name}
              </Text>
            </Pressable>
          )}
        />
      </BottomSheetView>
    </BottomSheet>
  );
}
