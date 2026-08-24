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

import { Colors } from "../constants";

export default function CrudListItemMenu({
  onAction,
  ...props
}: Omit<React.ComponentProps<typeof BottomSheet>, "children"> & {
  onAction: (action: "edit" | "delete") => void;
}) {
  const { bottom } = useSafeAreaInsets();
  const menuItems: {
    icon?: Icon;
    name: string;
    onPress: () => void;
    textStyle?: StyleProp<TextStyle>;
  }[] = [
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
      onPress: () => onAction("delete"),
    },
  ];

  return (
    <BottomSheet
      enablePanDownToClose
      enableOverDrag={false}
      snapPoints={["20%"]}
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
  );
}
