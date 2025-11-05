import Color from "color";
import { useState } from "react";
import { Image } from "expo-image";
import { CameraIcon } from "phosphor-react-native";
import { View, Text, type ViewStyle, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  type ImagePickerAsset,
  launchImageLibraryAsync,
} from "expo-image-picker";

import { BackButton } from "../Header";
import { Colors } from "../../constants";

type MealHeaderProps = {
  title?: string;
  style?: ViewStyle;
  navigation: { goBack: () => void };
  onImage: (file: ImagePickerAsset) => void;
} & React.ComponentProps<typeof View>;

export function MealHeader({
  title,
  navigation,
  onImage,
  ...props
}: MealHeaderProps) {
  const { top } = useSafeAreaInsets();
  const height = props?.style?.height ?? 280;
  const [image, setImage] = useState<string | null>(null);

  return (
    <View
      {...props}
      style={[props.style, { height }]}
    >
      <Pressable
        className="items-center justify-center"
        style={{
          inset: 0,
          position: "absolute",
          backgroundColor: Color(Colors.background[2]).alpha(0.5).hexa(),
        }}
        onPress={async () => {
          const result = await launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });

          if (result.assets && result.assets.length > 0) {
            onImage(result.assets[0]);
            setImage(result.assets[0].uri);
          }
        }}
      >
        {image ? (
          <Image
            source={image}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <View className="self-center items-center justify-center">
            <CameraIcon
              size={32}
              weight="fill"
              color="white"
            />
            <Text className="text-white font-poppins">Add Photo</Text>
          </View>
        )}
      </Pressable>
      <View
        style={{
          marginTop: top,
          flexDirection: "row",
          paddingHorizontal: 16,
        }}
      >
        <BackButton
          canGoBack
          navigation={navigation}
        />
        <Text className="flex-1 items-center justify-center text-center text-white font-poppins-medium">
          {title}
        </Text>
      </View>
    </View>
  );
}
