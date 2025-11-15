import Color from "color";
import { useFormik } from "formik";
import { useEffect, useMemo } from "react";
import { useNavigation } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import Button from "../Button";
import { Colors } from "../../constants";
import { useFirebase } from "../../providers";
import { useTRPC } from "../../providers/TRPCProvider";

export default function StepSheet(
  props: Omit<React.ComponentProps<typeof BottomSheet>, "children">,
) {
  const trpc = useTRPC();
  const navigation = useNavigation();
  const { user, setUser } = useFirebase();
  const intl = useMemo(() => new Intl.NumberFormat(), []);

  const { mutateAsync } = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess(data) {
        setUser((previous) => (previous ? { ...previous, ...data } : null));
      },
    }),
  );

  const { values, setFieldValue, isSubmitting, handleSubmit, handleBlur } =
    useFormik({
      initialValues: {
        steps: user.profile?.steps ?? 0,
      },
      async onSubmit(values) {
        return mutateAsync({ profile: { ...user.profile, ...values } });
      },
    });

  useEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: "none" } });

    return () => parent?.setOptions({ tabBarStyle: { display: "flex" } });
  }, [navigation]);

  return (
    <BottomSheet
      {...props}
      index={1}
      enableOverDrag={false}
      enablePanDownToClose
      snapPoints={["40%"]}
      backgroundStyle={{ backgroundColor: Colors.navColor }}
      handleIndicatorStyle={{ backgroundColor: Colors.grey, width: 64 }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
    >
      <BottomSheetView>
        <View className="gap-y-8 p-8">
          <View className="items-center justify-center">
            <Text className="text-xl text-white font-poppins-medium">
              Set your daily goal
            </Text>
            <Text
              className="text-sm text-white font-poppins"
              style={{ color: Colors.subtitleColor }}
            >
              Achieve your daily goal to continue your streak
            </Text>
          </View>
          <View className="flex-1 items-center">
            <View
              className="flex-1 w-3/4 border rounded-md overflow-hidden"
              style={{ borderColor: Color("white").alpha(0.1).hexa() }}
            >
              <LinearGradient
                start={{ x: 0, y: 0 }}
                locations={[0, 1]}
                colors={[
                  Colors.purple,
                  Color(Colors.purple).darken(0.5).hexa(),
                ]}
                style={{
                  width: "100%",
                  height: 16,
                  borderTopEndRadius: 4,
                  borderTopStartRadius: 4,
                }}
              />
              <View className="flex-1 flex-row items-center justify-center px-4">
                <Pressable
                  onPress={() =>
                    setFieldValue("steps", Math.max(values.steps - 1, 0))
                  }
                >
                  <AntDesign
                    size={24}
                    name="minuscircleo"
                    color={Colors.iconColor}
                  />
                </Pressable>
                <View className="flex-1 items-center justify-center">
                  <BottomSheetTextInput
                    value={values.steps.toLocaleString()}
                    placeholder="0"
                    inputMode="numeric"
                    placeholderTextColor="#621A89"
                    cursorColor={Colors.primary}
                    selectionColor={Colors.primary}
                    selectionHandleColor={Colors.primary}
                    underlineColorAndroid="transparent"
                    style={{
                      color: Colors.primary,
                      fontSize: 32,
                      textAlign: "center",
                      fontFamily: "Poppins_500Medium",
                    }}
                    onBlur={handleBlur("steps")}
                    onChangeText={(value) => setFieldValue("steps", value)}
                  />
                  <Text className="text-sm font-poppins text-white/75">
                    Steps
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    setFieldValue("steps", Math.max(values.steps + 1, 0))
                  }
                >
                  <AntDesign
                    size={24}
                    name="pluscircleo"
                    color={Colors.iconColor}
                  />
                </Pressable>
              </View>
            </View>
          </View>
          <Button
            disabled={isSubmitting}
            text="Set up daily goal"
            submitting={isSubmitting}
            onPress={() => handleSubmit()}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
