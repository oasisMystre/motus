import { Text, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { signOut } from "@react-native-firebase/auth";
import { WarningCircleIcon } from "phosphor-react-native";

import Button from "../Button";
import ModalDialog from "./ModalDialog";
import { Colors } from "../../constants";
import { useFirebase } from "../../providers";
import { useTRPC } from "../../providers/TRPCProvider";

export default function DeleteAccountModal(
  props: React.ComponentProps<typeof ModalDialog>,
) {
  const trpc = useTRPC();
  const { firebase } = useFirebase();
  const { mutateAsync } = useMutation(trpc.user.delete.mutationOptions());

  return (
    <ModalDialog
      {...props}
      containerStyle={{ height: "auto" }}
      containerClassName="w-[92%] max-w-[360px] self-center m-auto gap-y-8 px-4 py-6 rounded-xl"
    >
      <>
        <View className="gap-y-6">
          <View className="size-12 bg-white rounded-full items-center justify-center">
            <WarningCircleIcon color={Colors.primary} />
          </View>
          <View className="gap-y-2">
            <Text className="text-lg text-red-500 font-poppins-medium">
              Delete Account
            </Text>
            <Text
              className="font-poppins"
              style={{ color: Colors.grey }}
            >
              Are you sure you want to your account?
            </Text>
          </View>
        </View>
        <View className="flex-row gap-x-4">
          <Button
            text="No"
            className="flex-1"
            textAttrs={{ style: { color: "black" } }}
            style={{ backgroundColor: "white" }}
            onPress={(event) => props.onRequestClose?.(event)}
          />
          <Button
            text="Yes"
            className="flex-1"
            onPress={(event) => {
              mutateAsync().then(() => {
                signOut(firebase.auth).then(() =>
                  props.onRequestClose?.(event),
                );
              });
            }}
          />
        </View>
      </>
    </ModalDialog>
  );
}
