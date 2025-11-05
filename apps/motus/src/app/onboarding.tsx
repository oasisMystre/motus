import { v7 as uuid } from "uuid";
import { useTranslation } from "react-i18next";
import React, { useMemo, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Animated,
  type NativeScrollEvent,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useAppDispatch } from "../store";
import { authActions } from "../store/auth";
import useDimensions from "../hooks/useDimensions";
import {
  LinearGradientTextLayerBackground,
  PaginationDots,
  SwipeAbleButton,
} from "../components";

export default function OnboardingCarousel() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { width } = useDimensions("window");
  const { top, bottom } = useSafeAreaInsets();

  const scrollX = useRef(new Animated.Value(0));
  const [currentIndex, setCurrentIndex] = useState(0);

  const onboardingStories = [
    {
      imageAttrs: {
        source: require("../../assets/images/onboarding-screen-1.png"),
      },
      text: t("onboarding.subtitles.0", { returnObjects: true }),
    },
    {
      imageAttrs: {
        source: require("../../assets/images/onboarding-screen-2.png"),
        style: {
          top,
        },
      },
      text: t("onboarding.subtitles.1", { returnObjects: true }),
    },
    {
      text: t("onboarding.subtitles.2", { returnObjects: true }),
    },
  ];

  const onScroll = Animated.event<NativeScrollEvent>(
    [{ nativeEvent: { contentOffset: { x: scrollX.current } } }],
    {
      useNativeDriver: false,
      listener(event) {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
      },
    },
  );

  const showActionButton = useMemo(
    () => currentIndex >= onboardingStories.length - 1,
    [currentIndex],
  );

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <ScrollView
        style={{ flex: 1 }}
        bounces={false}
        onScroll={onScroll}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        horizontal
        pagingEnabled
      >
        {onboardingStories.map((story, index) => (
          <LinearGradientTextLayerBackground
            key={index}
            imageAttrs={story.imageAttrs}
          >
            <Text
              className="font-poppins"
              style={{
                paddingHorizontal: 8,
                lineHeight: 30,
                letterSpacing: 0,
                color: "white",
                textAlign: "center",
                marginBottom:
                  Platform.OS === "ios"
                    ? showActionButton
                      ? bottom * 5
                      : bottom * 3
                    : 180,
              }}
            >
              {story.text.join(" ")}
            </Text>
          </LinearGradientTextLayerBackground>
        ))}
      </ScrollView>
      <View
        style={{
          bottom,
          left: 0,
          right: 0,
          marginBottom: 24,
          position: "absolute",
          paddingHorizontal: 16,
          rowGap: showActionButton ? 24 : 0,
        }}
      >
        <PaginationDots
          length={onboardingStories.length}
          scrollX={scrollX.current}
          currentIndex={currentIndex}
        />
        {showActionButton && (
          <SwipeAbleButton
            onSwipeComplete={() => {
              const uid = uuid();
              AsyncStorage.setItem("anonymous_user", uid).then(() =>
                dispatch(authActions.setUser({ type: "anonymous", uid })),
              );
            }}
          />
        )}
      </View>
    </View>
  );
}
