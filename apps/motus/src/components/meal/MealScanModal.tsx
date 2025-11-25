import type z from "zod";
import { useMemo, useState } from "react";
import { CameraView } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import type { mealSelectSchema } from "@motus/server";
import { convertProductToMeal } from "@motus/openfoodfacts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product } from "@openfoodfacts/openfoodfacts-nodejs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Pressable,
  View,
  Modal,
  type GestureResponderEvent,
} from "react-native";

import Spinner from "../Spinner";
import { Colors } from "../../constants";
import { openFoodFact } from "../../utils";
import { MealScanResult } from "./MealScanResult";
import { withSnackbar, useSnackbar } from "../../providers/SnackbarProvider";

type MealScanModalProps = {
  onChange: (
    event: GestureResponderEvent,
    values: z.infer<typeof mealSelectSchema>[],
  ) => void;
} & React.ComponentProps<typeof Modal>;

export default withSnackbar(function MealScanModal({
  onChange,
  ...props
}: MealScanModalProps) {
  const snackbar = useSnackbar();
  const { top } = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [barcode, setBarcode] = useState<string | undefined>("06731906");

  const queryKey = useMemo(() => ["meal", barcode], [barcode]);

  const { data, isFetching } = useQuery({
    queryKey,
    enabled: Boolean(barcode),
    queryFn: async () => {
      if (barcode) {
        const response = await openFoodFact.getProductV2(barcode!);
        const result = response.data?.product as unknown as Product | undefined;

        if (result) return convertProductToMeal(result);
        else
          snackbar.error({
            text: "No product found!",
          });
      }
      return null;
    },
  });

  return (
    <Modal
      {...props}
      animationType="slide"
      backdropColor={Colors.backgroundColor}
    >
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={async (result) => setBarcode(result.data)}
      />
      <View
        className="flex flex-col justify-between absolute inset-0"
        style={{ paddingTop: top }}
      >
        <View
          className="flex flex-row"
          style={{
            paddingHorizontal: 16,
          }}
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
        {isFetching && (
          <View className="m-auto">
            <Spinner />
          </View>
        )}
        {data && (
          <MealScanResult
            meals={[data]}
            onChange={onChange}
            onClose={() => {
              setBarcode(undefined);
              queryClient.setQueryData(queryKey, undefined);
            }}
          />
        )}
      </View>
    </Modal>
  );
});
