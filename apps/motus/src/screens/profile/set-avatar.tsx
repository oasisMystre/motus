import type z from "zod";
import clsx from "clsx";
import { useState } from "react";
import { Image } from "expo-image";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { ImageIcon } from "phosphor-react-native";
import type { userSelectSchema } from "@motus/server";
import { launchImageLibraryAsync } from "expo-image-picker";
import { Octicons, MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, View, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../../constants";
import useDimensions from "../../hooks/useDimensions";
import { avatars } from "../../datasources/local/avatars";
import { CircularBackButton } from "../../components/Header";

type SetAvatarScreenProps = {
  goBack: () => void;
};

export function SetAvatarScreen({ goBack }: SetAvatarScreenProps) {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const { width } = useDimensions("window");
  const [asset, setAsset] = useState<string | null>(null);

  const {
    isValid,
    isSubmitting,
    values,
    setFieldValue,
    handleSubmit,
    handleBlur,
  } = useFormikContext<Partial<z.infer<typeof userSelectSchema>>>();

  return (
    <View
      style={{ width, marginBottom: bottom }}
      className="flex-1 mt-6 px-6"
    >
      <View className="flex-1 gap-y-8">
        <View className="flex-row items-center">
          <Text className="flex-1 text-lg text-white font-poppins-medium">
            {t("auth.profile.set_avatar.title")}
          </Text>
          <Pressable onPress={() => handleSubmit()}>
            <Text
              className="font-poppins"
              style={{ color: Colors.grey }}
            >
              {t("auth.profile.set_avatar.skip_action")}
            </Text>
          </Pressable>
        </View>
        <View className="items-center gap-y-8">
          <Pressable
            onPress={async () => {
              const result = await launchImageLibraryAsync({
                quality: 1,
                aspect: [4, 3],
                allowsEditing: true,
                mediaTypes: ["images"],
              });
              if (result.assets && result.assets.length > 0) {
                const [image] = result.assets;
                setAsset(image.uri);
              }
            }}
          >
            <View className="size-32 bg-stone-50 rounded-full items-center justify-center">
              {asset ? (
                <Image
                  source={asset}
                  style={{ width: 128, height: 128, borderRadius: 100 }}
                />
              ) : (
                <MaterialIcons
                  name="person"
                  size={64}
                />
              )}
              <View className="absolute -bottom-4 right-0 bg-primary p-2 rounded-full">
                <ImageIcon color="white" />
              </View>
            </View>
          </Pressable>
        </View>
        <View className="flex-1">
          <Text className="text-white font-poppins">
            {t("auth.profile.set_avatar.avatar_list_title")}
          </Text>
          <FlatList
            data={avatars}
            numColumns={Math.floor((width - 48) / 72)}
            columnWrapperStyle={{
              gap: 16,
              marginVertical: 8,
              justifyContent: "space-between",
            }}
            renderItem={({ item }) => {
              const selected = item.url === values.profile?.avatar;

              return (
                <Pressable
                  onPress={() => {
                    setAsset(item.local);
                    setFieldValue(
                      "profile.avatar",
                      selected ? undefined : item.url,
                    );
                  }}
                  onBlur={handleBlur("profile.avatar")}
                  className="relative"
                >
                  <Image
                    source={item.local}
                    className="transition-all"
                    style={[
                      { width: 72, height: 72, borderRadius: 100 },
                      selected && {
                        borderWidth: 3,
                        borderColor: Colors.primary,
                      },
                    ]}
                  />

                  <Octicons
                    name="check-circle-fill"
                    color="white"
                    size={24}
                    className={clsx(
                      "absolute right-0 bg-primary rounded-full transition-all",
                      selected ? "opacity-100 scale-1" : "opacity-0 scale-0",
                    )}
                  />
                </Pressable>
              );
            }}
          />
        </View>
      </View>
      <View className="flex-row items-center gap-x-8">
        <CircularBackButton
          canGoBack
          navigation={{ goBack }}
        />
        <Pressable
          disabled={isSubmitting && !isValid}
          onPress={() => handleSubmit()}
          className="flex-1 items-center justify-center p-4 rounded-md"
          style={{ backgroundColor: isValid ? Colors.primary : Colors.grey }}
        >
          <Text className="text-white font-poppins">
            {t("auth.next_action")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
