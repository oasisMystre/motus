import type z from "zod";
import { Text, View } from "react-native";
import { BarbellIcon } from "phosphor-react-native";
import type { exerciseSelectSchema } from "@motus/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Button from "../Button";
import { Colors } from "../../constants";
import ModalDialog from "../modals/ModalDialog";
import { useTRPC } from "../../providers/TRPCProvider";

export function ExerciseConfirmDeletion({
  exercise,
  ...props
}: React.ComponentProps<typeof ModalDialog> & {
  exercise: z.infer<typeof exerciseSelectSchema>;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation(
    trpc.exercise.delete.mutationOptions({
      onSuccess(_, { id }) {
        queryClient.setQueryData(trpc.exercise.list.queryKey(), (previous) =>
          previous
            ? {
                ...previous,
                custom: previous.custom.filter((item) => item.id !== id),
              }
            : undefined,
        );
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
              Delete Exercise
            </Text>
            <Text
              className="font-poppins"
              style={{ color: Colors.grey }}
            >
              Are you sure you want to delete this exercise?
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
            onPress={() => mutateAsync({ id: exercise.id })}
          />
        </View>
      </>
    </ModalDialog>
  );
}
