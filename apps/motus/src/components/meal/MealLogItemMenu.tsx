import type z from "zod";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import type { mealLogSelectSchema } from "@motus/server";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type Icon, NotePencilIcon } from "phosphor-react-native";
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
import { MealLogConfirmDeletion } from "./MealLogConfirmDeletion";

export function MealLogItemMenu({
  meal,
  ...props
}: Omit<React.ComponentProps<typeof BottomSheet>, "children"> & {
  meal: z.infer<typeof mealLogSelectSchema>;
}) {
  const { bottom } = useSafeAreaInsets();
  const [showDeleteMealLogModal, setShowDeleteMealLogModal] = useState(false);
  const onAction = useCallback(
    (action: "edit" | "duplicate") => {
      props.onClose?.();

      return router.push({
        pathname: "/(tabs)/(log)/(log-meal)/(add-meal)",
        params: {
          action,
          id: meal.id,
        },
      });
    },
    [props.onClose, meal.id],
  );

  const menuItems: {
    icon?: Icon;
    name: string;
    onPress: () => void;
    textStyle?: StyleProp<TextStyle>;
  }[] = [
    {
      icon: (props) => (
        <MaterialCommunityIcons
          name="content-copy"
          size={Number(props.size)}
          color={props.color}
        />
      ),
      name: "Duplicate",
      onPress: () => onAction("duplicate"),
    },
    {
      icon: NotePencilIcon,
      name: "Edit",
      onPress: () => onAction("edit"),
    },
    {
      icon: (props) => (
        <MaterialCommunityIcons
          name="delete-outline"
          size={Number(props.size)}
          color={Colors.red[2]}
        />
      ),
      name: "Delete",
      textStyle: { color: Colors.red[2] },
      onPress: () => setShowDeleteMealLogModal(true),
    },
  ];

  return (
    <>
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
              <View
                style={{ height: 0.5, backgroundColor: Colors.border[1] }}
              />
            )}
            renderItem={({ item }) => (
              <Pressable
                className="flex-row items-center gap-x-2 p-4"
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
      {showDeleteMealLogModal && (
        <MealLogConfirmDeletion
          log={meal.id}
          visible={showDeleteMealLogModal}
          onRequestClose={() => {
            setShowDeleteMealLogModal(false);
            props.onClose?.();
          }}
        />
      )}
    </>
  );
}
