import { useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState, useCallback } from "react";
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
} from "react-native-keyboard-controller";
import {
  View,
  Text,
  Pressable,
  Animated,
  type ScrollView,
  type NativeScrollEvent,
} from "react-native";

import { Colors } from "../../../../constants";
import Avatar from "../../../../components/Avatar";
import { useUser } from "../../../../hooks/useUser";
import useDimensions from "../../../../hooks/useDimensions";
import InfoScreen from "../../../../screens/profile/InfoScreen";
import ItemsScreen from "../../../../screens/profile/ItemsScreen";

export default function ProfileScreen() {
  const { width } = useDimensions("window");
  const courosel = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0));
  const [currentIndex, setCurrentIndex] = useState(0);
  const { id } = useLocalSearchParams<{ id: string }>();

  const tabs = useMemo(
    () => [
      { title: "My Info", tab: InfoScreen },
      { title: "My Items", tab: ItemsScreen },
    ],
    [],
  );

  const user = useUser(id);

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

  const scrollTo = useCallback(
    (index: number) =>
      courosel.current?.scrollTo({ x: width * index, animated: true }),
    [],
  );

  return (
    user && (
      <KeyboardAvoidingView>
        <View className="gap-y-8">
          <View className="items-center justify-center gap-y-2">
            <Avatar
              url={user.profile.avatar}
              style={{ width: 72, height: 72 }}
            />
            <Text
              className="font-poppins"
              style={{ color: Colors.grey }}
            >
              {user.name}
            </Text>
          </View>
          <View className="flex-row">
            {tabs.map((tab, index) => {
              const selected = currentIndex === index;

              return (
                <Pressable
                  key={tab.title}
                  style={{
                    flex: 1,
                    paddingBottom: 8,
                    borderBottomWidth: 3,
                    borderBottomColor: selected ? Colors.primary : Colors.grey,
                  }}
                  onPress={() => scrollTo(index)}
                >
                  <Text className="text-white font-poppins text-center">
                    {tab.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <KeyboardAwareScrollView
          ref={courosel}
          horizontal
          onScroll={onScroll}
          showsHorizontalScrollIndicator={false}
          style={{ height: "80%" }}
        >
          {tabs.map(({ title, tab }) => {
            const Tab = tab;
            return (
              <Tab
                key={title}
                user={user}
              />
            );
          })}
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    )
  );
}
