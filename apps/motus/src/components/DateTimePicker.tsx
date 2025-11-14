import { Platform } from "react-native";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

import { Colors } from "../constants";

type DateTimePicker = {};

export default function DateTimePicker({
  modalAttrs,
  ...props
}: React.ComponentProps<typeof RNDateTimePicker> & {
  modalAttrs?: Omit<React.ComponentProps<typeof BottomSheet>, "children">;
}) {
  return (
    <DateTimePickerWrapper {...modalAttrs}>
      <RNDateTimePicker
        mode="datetime"
        display="spinner"
        textColor="white"
        themeVariant="dark"
        accentColor={Colors.primary}
        style={{ flex: 1, backgroundColor: "transparent" }}
        {...props}
        onChange={(...args) => {
          props.onChange?.(...args);
          if (Platform.OS !== "ios") modalAttrs?.onClose?.();
        }}
      />
    </DateTimePickerWrapper>
  );
}

const DateTimePickerWrapper = ({
  children,
  ...props
}: React.PropsWithChildren<React.ComponentProps<typeof BottomSheet>>) => {
  if (Platform.OS === "ios")
    return (
      <BottomSheet
        enableOverDrag={false}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: Colors.grey, width: 64 }}
        backgroundStyle={{ backgroundColor: Colors.darkGray }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
        {...props}
      >
        <BottomSheetView className="flex-1 h-58 items-center justify-center">
          {children}
        </BottomSheetView>
      </BottomSheet>
    );

  return children;
};
