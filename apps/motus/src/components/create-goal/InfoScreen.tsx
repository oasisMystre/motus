import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  Text,
  View,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CircularBackButton } from "../Header";
import { LinearGradientTextLayerBackground } from "..";

type InfoScreenProps = {
  title: string;
  description: string;
  onBack?: () => void;
  onNext: () => void;
  style?: StyleProp<ViewStyle>;
};

export function InfoScreen({
  title,
  description,
  onNext,
  onBack,
  style,
}: InfoScreenProps) {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();

  return (
    <LinearGradientTextLayerBackground>
      <View
        className="gap-y-16"
        style={[
          {
            paddingHorizontal: 16,
            paddingBottom: bottom,
          },
          style,
        ]}
      >
        <View className="gap-y-2">
          <Text className="text-2xl text-primary font-poppins-medium tracking-normal">
            {title}
          </Text>
          <Text
            className=" tracking-normal font-poppins"
            style={{
              color: "#F2F2F2",
              lineHeight: 24,
            }}
          >
            {description}
          </Text>
        </View>
        <View className="flex-row gap-x-8">
          <CircularBackButton
            canGoBack
            navigation={{ goBack: onBack ? onBack : router.back }}
          />
          <Pressable
            className="flex-1 items-center justify-center bg-primary rounded-md"
            onPress={onNext}
          >
            <Text className="text-white font-poppins">
              {t("auth.next_action")}
            </Text>
          </Pressable>
        </View>
      </View>
    </LinearGradientTextLayerBackground>
  );
}
