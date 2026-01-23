import { Text, View } from "react-native";
import { BarbellIcon } from "phosphor-react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Button from "../Button";
import { Colors } from "../../constants";
import ModalDialog from "../modals/ModalDialog";
import { useTRPC } from "../../providers/TRPCProvider";
import { useTanstackStore } from "../../hooks/useTanstackStore";

export function MealLogConfirmDeletion({
  log,
  ...props
}: React.ComponentProps<typeof ModalDialog> & { log: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { remove } = useTanstackStore(
    queryClient,
    trpc.log.meal.list.queryKey(),
    (meal) => meal.id,
  );

  const { isPending, mutateAsync } = useMutation(
    trpc.log.meal.delete.mutationOptions({
      onSuccess(_, { id }) {
        remove(id);
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
    </ModalDialog>
  );
}
