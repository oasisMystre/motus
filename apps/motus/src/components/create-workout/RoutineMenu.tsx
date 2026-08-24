import type z from "zod";
import { format } from "util";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import type { routineSelectSchema } from "@motus/server";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type Icon, NotePencilIcon, ShareIcon } from "phosphor-react-native";
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
import { formActions } from "../../store/form";
import { RoutineConfirmDeletion } from "./RoutineConfirmDeletion";

export function RoutineMenu({
  routine,
  ...props
}: Omit<React.ComponentProps<typeof BottomSheet>, "children"> & {
  routine: z.infer<typeof routineSelectSchema>;
}) {
  const dispatch = useAppDispatch();
  const { bottom } = useSafeAreaInsets();
  const [showDeleteRoutineModal, setShowDeleteRoutineModal] = useState(false);
  const onAction = useCallback(
    (action: "edit" | "duplicate") => {
      dispatch(
        formActions.updateWorkoutForm({
          name: format(
            "%s%s",
            routine.name,
            action === "duplicate" ? " Copy" : "",
          ),
          exercises: routine.metadata.exercises,
        }),
      );

      props.onClose?.();

      return router.push({
        pathname: "/(tabs)/(log)/(create-workout)/(create-routine)",
        params: {
          action,
        },
      });
    },
    [dispatch, routine.name, routine.metadata.exercises, props.onClose],
  );

  const menuItems: {
    icon?: Icon;
    name: string;
    onPress: () => void;
    textStyle?: StyleProp<TextStyle>;
  }[] = [
    { icon: ShareIcon, name: "Share Routine", onPress: () => {} },
    {
      icon: (props) => (
        <MaterialCommunityIcons
          name="content-copy"
          size={Number(props.size)}
          color={props.color}
        />
      ),
      name: "Duplicate Routine",
      onPress: () => onAction("duplicate"),
    },
    {
      icon: NotePencilIcon,
      name: "Edit Routine",
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
      name: "Delete Routine",
      textStyle: { color: Colors.red[2] },
      onPress: () => setShowDeleteRoutineModal(true),
    },
  ];

  return (
    <>
      <BottomSheet
        enablePanDownToClose
        enableOverDrag={false}
        snapPoints={["40%"]}
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
      {showDeleteRoutineModal && (
        <RoutineConfirmDeletion
          routine={routine.id}
          visible={showDeleteRoutineModal}
          onRequestClose={() => {
            setShowDeleteRoutineModal(false);
            props?.onClose?.();
          }}
        />
      )}
    </>
  );
}
