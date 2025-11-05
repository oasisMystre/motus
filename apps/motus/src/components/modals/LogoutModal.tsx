import { Text, View } from "react-native";
import { signOut } from "@react-native-firebase/auth";
import { WarningCircleIcon } from "phosphor-react-native";

import Button from "../Button";
import ModalDialog from "./ModalDialog";
import { Colors } from "../../constants";
import { useFirebase } from "../../providers";

export default function LogoutModal(
  props: React.ComponentProps<typeof ModalDialog>,
) {
  const { firebase } = useFirebase();

  return (
    <ModalDialog
      {...props}
      containerClassName="w-[92%] max-w-[360px] self-center m-auto gap-y-8 px-4 py-6 rounded-xl"
      containerStyle={{ height: "auto" }}
    >
      <>
        <View className="gap-y-6">
          <View className="size-12 bg-white rounded-full items-center justify-center">
            <WarningCircleIcon color={Colors.primary} />
          </View>
          <View className="gap-y-2">
            <Text className="text-lg text-red-500 font-poppins-medium">
              Log Out
            </Text>
            <Text
              className="font-poppins"
              style={{ color: Colors.grey }}
            >
              Are you sure you want to log out
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
            onPress={(event) =>
              signOut(firebase.auth).then(() => props.onRequestClose?.(event))
            }
          />
        </View>
      </>
    </ModalDialog>
  );
}
