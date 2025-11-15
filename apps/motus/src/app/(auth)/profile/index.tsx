import { Formik } from "formik";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { userInsertSchema } from "@motus/server";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
  Animated,
  type NativeScrollEvent,
  type ScrollView,
  View,
} from "react-native";

import { Colors } from "../../../constants";
import { withZodSchema } from "../../../utils";
import useDimensions from "../../../hooks/useDimensions";
import { useFirebase, useLoading } from "../../../providers";
import { useTRPCClient } from "../../../providers/TRPCProvider";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  SetNameScreen,
  SetGenderScreen,
  SetAgeScreen,
  SetHeightScreen,
  SetWeightScreen,
  SetAvatarScreen,
  SetUsernameScreen,
} from "../../../screens/profile";

const screens = [
  SetNameScreen,
  SetUsernameScreen,
  SetGenderScreen,
  SetAgeScreen,
  SetHeightScreen,
  SetWeightScreen,
  SetAvatarScreen,
];

export default function ProfileScreen() {
  const trpc = useTRPCClient();
  const loading = useLoading();
  const { top } = useSafeAreaInsets();
  const courosel = useRef<ScrollView>(null);
  const { width } = useDimensions("window");
  const scrollX = useRef(new Animated.Value(0));

  const dispatch = useAppDispatch();
  const { user, setUser } = useFirebase();

  const [currentIndex, setCurrentIndex] = useState(0);
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

  const goTo = (index: number) => () =>
    courosel.current?.scrollTo({ x: width * index, animated: true });

  return (
    <Formik
      initialValues={{ ...user }}
      validate={withZodSchema(userInsertSchema.partial())}
      onSubmit={async (values) => {
        return loading.promise(
          trpc.user.update
            .mutate(await userInsertSchema.partial().parseAsync(values))
            .then((data) => {
              setUser((previous) =>
                previous ? { ...previous, ...data } : null,
              );
              router.replace("/(tabs)");
            }),
          {
            title: "Great work",
            subtitle: "We are adding finishing touches",
          },
        );
      }}
    >
      <View
        style={{ flex: 1, marginTop: top * 1.5 }}
        className="flex-1"
      >
        <View className="flex-row gap-x-2 px-12">
          {screens.map((_, index) => (
            <View
              key={index}
              className="flex-1 h-0.5"
              style={{
                backgroundColor:
                  currentIndex === index ? Colors.primary : Colors.grey,
              }}
            />
          ))}
        </View>
        <KeyboardAwareScrollView
          ref={courosel}
          horizontal
          scrollEnabled={false}
          onScroll={onScroll}
          className="flex-1"
          showsHorizontalScrollIndicator={false}
        >
          {screens.map((screen, index, screens) => {
            const Screen = screen;
            return (
              <Screen
                key={index}
                goBack={goTo(Math.max(index - 1, 0))}
                next={goTo(Math.min(index + 1, screens.length))}
              />
            );
          })}
        </KeyboardAwareScrollView>
      </View>
    </Formik>
  );
}
