import { router } from "expo-router";
import { Text, View } from "react-native";
import { BarbellIcon } from "phosphor-react-native";

import Button from "../Button";
import { Colors } from "../../constants";
import ModalDialog from "../modals/ModalDialog";

export function DiscardWorkoutModal(
  props: React.ComponentProps<typeof ModalDialog>,
) {
  return (
    <ModalDialog
      {...props}
      containerClassName="w-[92%] max-w-[360px] self-center m-auto gap-y-8 px-4 py-6 rounded-xl"
      containerStyle={{ height: "auto" }}
    >
      <>
        <View className="gap-y-6">
          <View className="size-12 bg-white rounded-full items-center justify-center">
            <BarbellIcon color={Colors.primary} />
          </View>
          <View>
            <Text className="text-lg text-red-500 font-poppins-medium">
              Discard Workout
            </Text>
            <Text
              className="font-poppins"
              style={{ color: Colors.grey }}
            >
              Are you sure you want to discard this workout?
            </Text>
          </View>
        </View>
        <View className="flex-row gap-x-4">
          <Button
            text="Cancel"
            className="flex-1"
            textAttrs={{ style: { color: "black" } }}
            style={{ backgroundColor: "white" }}
            onPress={() => props.onRequestClose?.()}
          />
          <Button
            text="Discard workout"
            className="flex-1"
            onPress={() => router.dismissAll()}
          />
        </View>
      </>
    </ModalDialog>
  );
}
