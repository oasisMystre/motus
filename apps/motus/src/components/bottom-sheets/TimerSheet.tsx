import Color from "color";
import ms from "pretty-ms";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import Button from "../Button";
import { Colors } from "../../constants";
import DropdownPicker from "../forms/DropdownPicker";

type TimerPickerProps = {
  value?: number;
  onChange(value: number): void;
};

export default forwardRef<
  Pick<BottomSheet, "close">,
  Omit<React.ComponentProps<typeof BottomSheet>, "children"> & TimerPickerProps
>(function TimerSheet({ value, onChange, ...props }, ref) {
  const { bottom } = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);

  useImperativeHandle(ref, () => ({
    close: () => sheetRef.current?.close(),
  }));

  const values: { label: string; value: number }[] = useMemo(
    () => [
      { label: "off", value: 0 },
      ...Array.from({ length: 60 }).map((_, index) => {
        const duration = (index + 1) * (5 * 1000);
        return { label: ms(duration), value: duration };
      }),
    ],
    [],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      {...props}
      index={1}
      enableOverDrag={false}
      enablePanDownToClose
      snapPoints={["50%"]}
      backgroundStyle={{ backgroundColor: Colors.background[3] }}
      handleIndicatorStyle={{ backgroundColor: Colors.grey, width: 64 }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
    >
      <BottomSheetView>
        <View
          style={{
            borderBottomWidth: 1,
            paddingBottom: 8,
            borderColor: Colors.border[0],
          }}
        >
          <Text className="text-lg text-white font-poppins-me text-center">
            Rest Timer
          </Text>
        </View>
        <DropdownPicker
          value={value}
          data={values}
          style={{ marginHorizontal: 16 }}
          itemTextStyle={{ color: "white" }}
          overlayItemStyle={{
            opacity: 0.5,
            backgroundColor: Color(Colors.background[6]).alpha(1).hexa(),
          }}
          onValueChanged={({ item: { value } }) => onChange(value)}
        />
        <Button
          text="Done"
          onPress={() => sheetRef?.current?.close()}
          style={{ marginBottom: bottom, marginHorizontal: 16 }}
        />
      </BottomSheetView>
    </BottomSheet>
  );
});
