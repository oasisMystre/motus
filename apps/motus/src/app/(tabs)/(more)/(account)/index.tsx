import { Text } from "react-native";
import { useState } from "react";
import { type Link, router } from "expo-router";
import { Pressable, FlatList } from "react-native";
import {
  EnvelopeIcon,
  type Icon,
  PasswordIcon,
  UserIcon,
} from "phosphor-react-native";

import { Colors } from "../../../../constants";
import Button from "../../../../components/Button";
import DeleteAccountModal from "../../../../components/modals/DeleteAccountModal";

export default function AccountSettingScreen() {
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const items: {
    icon: Icon;
    name: string;
    path?: React.ComponentProps<typeof Link>["href"];
  }[] = [
    {
      icon: UserIcon,
      name: "Change Username",
      path: "/set-username",
    },
    {
      icon: EnvelopeIcon,
      name: "Change Email",
      path: "/set-email",
    },
    {
      icon: PasswordIcon,
      name: "Update Password",
      path: "/set-password",
    },
  ];
  return (
    <>
      <FlatList
        data={items}
        style={{ marginTop: 24 }}
        renderItem={({ item }) => {
          return (
            <Pressable
              className="flex-row items-center gap-x-4 px-8 py-5 last:border-b"
              style={{
                backgroundColor: Colors.darkGray,
                borderColor: Colors.dividerColor,
              }}
              onPress={() => {
                if (item.path) router.push(item.path);
              }}
            >
              <item.icon
                color="white"
                size={18}
              />
              <Text className="text-white font-poppins">{item.name}</Text>
            </Pressable>
          );
        }}
        ListFooterComponent={() => (
          <Button
            text="Delete Account"
            textAttrs={{ style: { color: Colors.red[3] } }}
            style={{ backgroundColor: "transparent" }}
            onPress={() => setShowDeleteAccountModal(true)}
          />
        )}
      />
      <DeleteAccountModal
        visible={showDeleteAccountModal}
        onRequestClose={() => setShowDeleteAccountModal(false)}
      />
    </>
  );
}
