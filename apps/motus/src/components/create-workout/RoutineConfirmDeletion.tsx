import { Text, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { BarbellIcon } from "phosphor-react-native";

import Button from "../Button";
import { Colors } from "../../constants";
import { useAppDispatch } from "../../store";
import ModalDialog from "../modals/ModalDialog";
import { routineActions } from "../../store/routine";
import { useTRPC } from "../../providers/TRPCProvider";

export function RoutineConfirmDeletion({
  routine,
  ...props
}: React.ComponentProps<typeof ModalDialog> & { routine: string }) {
  const trpc = useTRPC();
  const dispatch = useAppDispatch();
  const { isPending, mutateAsync } = useMutation(
    trpc.routine.delete.mutationOptions({
      onSuccess() {
        dispatch(routineActions.removeRoutine(routine));
        props?.onRequestClose?.();
      },
    }),
  );

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
            disabled={isPending}
            submitting={isPending}
            text="Delete"
            className="flex-1"
            style={{ backgroundColor: Colors.primary }}
            onPress={() => mutateAsync({ id: routine })}
          />
        </View>
      </>
    </ModalDialog>
  );
}
