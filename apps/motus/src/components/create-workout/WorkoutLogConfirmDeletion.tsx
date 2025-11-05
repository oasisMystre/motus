import { Text, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { BarbellIcon } from "phosphor-react-native";

import Button from "../Button";
import { Colors } from "../../constants";
import { useAppDispatch } from "../../store";
import { logActions } from "../../store/log";
import ModalDialog from "../modals/ModalDialog";
import { useTRPC } from "../../providers/TRPCProvider";

export function WorkoutConfirmDeletion({
  log,
  ...props
}: React.ComponentProps<typeof ModalDialog> & { log: string }) {
  const trpc = useTRPC();
  const dispatch = useAppDispatch();
  const { isPending, mutateAsync } = useMutation(
    trpc.log.workout.delete.mutationOptions({
      onSuccess(_, { id }) {
        dispatch(logActions.removeWorkout(id));
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
              Discard Log
            </Text>
            <Text
              className="font-poppins"
              style={{ color: Colors.grey }}
            >
              Are you sure you want to discard this log?
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
            onPress={() => mutateAsync({ id: log })}
          />
        </View>
      </>
    </ModalDialog>
  );
}
