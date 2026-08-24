import type z from "zod";
import { useMemo, useState } from "react";
import type { mealSelectSchema } from "@motus/server";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Text,
  View,
  Pressable,
  Modal,
  type NativeSyntheticEvent,
} from "react-native";

import FoodTab from "./FoodTab";
import { BackButton } from "../Header";
import FoodUserTab from "./FoodUserTab";
import { Colors } from "../../constants";
import SearchInput, { SearchProvider } from "../SearchInput";
import LoadingProvider from "../../providers/LoadingProvider";
import SnackbarProvider from "../../providers/SnackbarProvider";

type AddFoodModalProps = {
  values: z.infer<typeof mealSelectSchema>[];
  onRequestClose?: (ev?: NativeSyntheticEvent<any>) => void;
  onChange: (values: z.infer<typeof mealSelectSchema>[]) => void;
} & React.ComponentProps<typeof Modal>;

export default function AddFoodModal({
  values,
  onChange,
  onRequestClose,
  ...props
}: AddFoodModalProps) {
  const { top } = useSafeAreaInsets();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tabs = useMemo(
    () => [
      { label: "All", tab: FoodTab },
      { label: "My Foods", tab: FoodUserTab },
    ],
    [],
  );

  const CurrentTab = useMemo(() => tabs[selectedIndex], [tabs, selectedIndex]);

  return (
    <SnackbarProvider>
      <LoadingProvider>
        <SearchProvider>
          <Modal
            {...props}
            animationType="slide"
            onRequestClose={onRequestClose}
            backdropColor={Colors.backgroundColor}
          >
            <View
              style={{
                flex: 1,
                paddingTop: top,
              }}
            >
              <View style={{ paddingHorizontal: 16 }}>
                <View className="flex flex-row items-center">
                  <BackButton
                    canGoBack
                    navigation={{
                      goBack: (event) => onRequestClose?.(event),
                    }}
                  />
                  <Text className="flex-1 text-lg text-white text-center font-poppins-medium">
                    Add Food
                  </Text>
                </View>
                <View className="gap-y-6">
                  <SearchInput
                    inputAttrs={{ placeholder: "Search for a food" }}
                  />
                  <View className="flex-row gap-x-8">
                    {tabs.map((tab, index) => {
                      const active = selectedIndex === index;

                      return (
                        <Pressable
                          key={index}
                          style={{
                            minWidth: 40,
                            paddingBottom: 2,
                            borderBottomWidth: 2,
                            paddingHorizontal: 8,
                            borderBottomColor: active
                              ? Colors.primary
                              : "transparent",
                          }}
                          onPress={() => setSelectedIndex(index)}
                        >
                          <Text
                            style={{
                              color: active ? "white" : Colors.grey,
                              fontFamily: active
                                ? "Poppins_500Medium"
                                : "Poppins_400Regular",
                            }}
                          >
                            {tab.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
              <CurrentTab.tab
                values={values}
                onChange={onChange}
                onRequestClose={onRequestClose}
              />
            </View>
          </Modal>
        </SearchProvider>
      </LoadingProvider>
    </SnackbarProvider>
  );
}
