import { Pressable, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { type BarcodeScanningResult, CameraView } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ModalDialog from "./ModalDialog";
import useDimensions from "../../hooks/useDimensions";

type CameraModalProps = {
  onScanned: (code: BarcodeScanningResult) => void;
} & React.ComponentProps<typeof ModalDialog>;

export default function CameraModal({ onScanned, ...props }: CameraModalProps) {
  const { top } = useSafeAreaInsets();
  const { height } = useDimensions("window");

  return (
    <ModalDialog
      {...props}
      className="h-auto"
      style={{ height }}
      containerStyle={{ height, backgroundColor: "transparent" }}
    >
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={onScanned}
      />
      <View
        className="absolute inset-0"
        style={{ paddingTop: top, paddingHorizontal: 16 }}
      >
        <Pressable
          onPress={(event) => props.onRequestClose?.(event)}
          className="bg-primary size-10 items-center justify-center rounded-full rounded-full"
        >
          <MaterialIcons
            name="expand-more"
            size={32}
            color="white"
            style={{ alignSelf: "center" }}
          />
        </Pressable>
      </View>
    </ModalDialog>
  );
}
