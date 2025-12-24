import type z from "zod";
import { CameraView } from "expo-camera";
import { useMemo, useRef, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import type { mealSelectSchema } from "@motus/server";
import { convertProductToMeal } from "@motus/openfoodfacts";
import type { Product } from "@openfoodfacts/openfoodfacts-nodejs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Pressable,
  View,
  Modal,
  ActivityIndicator,
  type GestureResponderEvent,
} from "react-native";

import Spinner from "../Spinner";
import { Colors } from "../../constants";
import { openFoodFact } from "../../utils";
import { MealScanResult } from "./MealScanResult";
import { useTRPCClient } from "../../providers/TRPCProvider";
import { withSnackbar, useSnackbar } from "../../providers/SnackbarProvider";

type MealScanModalProps = {
  type: "scan" | "picture";
  onChange: (
    event: GestureResponderEvent,
    values: z.infer<typeof mealSelectSchema>[],
  ) => void;
} & React.ComponentProps<typeof Modal>;

export default withSnackbar(function MealScanModal({
  type,
  onChange,
  ...props
}: MealScanModalProps) {
  const snackbar = useSnackbar();
  const trpcClient = useTRPCClient();
  const queryClient = useQueryClient();
  const { top, bottom } = useSafeAreaInsets();
  const cameraRef = useRef<CameraView | null>(null);
  const [barcode, setBarcode] = useState<string | undefined>();

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

  const { mutateAsync: takePicture, isPending } = useMutation({
    mutationFn: async () => {
      const response = await cameraRef.current?.takePictureAsync({
        quality: 0.2,
        base64: true,
        skipProcessing: true,
      });

      if (response?.base64) {
        const meals = await trpcClient.mcp.scanMeal.mutate({
          image: response?.base64,
        });
        if (meals.length > 0)
          queryClient.setQueryData<z.infer<typeof mealSelectSchema>[]>(
            queryKey,
            meals,
          );
      } else
        snackbar.error({
          text: "No product found!",
        });
    },
    onError() {
      snackbar.error({
        text: "Oops! can't identify meal.",
      });
    },
  });

  return (
    <Modal
      {...props}
      animationType="slide"
      backdropColor={Colors.backgroundColor}
    >
      <CameraView
        ref={cameraRef}
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
        {type === "picture" && (
          <Pressable
            disabled={isPending}
            className="mx-auto relative flex items-center justify-center"
            onPress={() => takePicture()}
          >
            <View
              className="absolute size-24 rounded-full bg-primary/50"
              style={{ marginBottom: bottom }}
            />
            <View
              className="size-16 flex items-center justify-center rounded-full bg-primary"
              style={{ marginBottom: bottom }}
            >
              {isPending && (
                <ActivityIndicator
                  size={32}
                  color="#FFFFFF"
                />
              )}
            </View>
          </Pressable>
        )}
      </View>
    </Modal>
  );
});
