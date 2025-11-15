import color from "color";
import { useFormik } from "formik";
import { useNavigation } from "expo-router";
import { useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Switch, Text, View, FlatList, Platform } from "react-native";

import { Colors } from "../../../constants";
import { useFirebase } from "../../../providers";
import { useTRPC } from "../../../providers/TRPCProvider";

export default function NotificationSettingsScreen() {
  const trpc = useTRPC();
  const { user, setUser } = useFirebase();
  const navigation = useNavigation();

  const { mutateAsync } = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess(data) {
        setUser((previous) => (previous ? { ...previous, ...data } : null));
      },
    }),
  );

  const { values, setFieldValue, handleSubmit } = useFormik({
    initialValues: user.settings.notifications,
    onSubmit(values) {
      return mutateAsync({
        id: user.id,
        settings: { ...user.settings, notifications: values },
      });
    },
  });

  const forms = useMemo(
    () => [
      {
        name: "follow",
        title: "Follows",
        checked: values.follow,
      },
      {
        name: "like.post",
        title: "Likes on your post",
        checked: values.like.post,
      },
      {
        name: "like.comment",
        title: "Likes on your comments",
        checked: values.like.comment,
      },
      {
        name: "comment.workout",
        title: "Comments on your workouts",
        checked: values.comment.workout,
      },
      {
        name: "comment.reply",
        title: "Comments replies",
        description:
          "Get a notification when someone replies to your comments.",
        checked: values.comment.reply,
      },
      {
        name: "comment.mention",
        title: "Comments mentions",
        description:
          "Get a notification when some @ mentions you in a comment.",
        checked: values.comment.mention,
      },
    ],
    [values],
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      handleSubmit();
    });

    return () => unsubscribe();
  }, [navigation]);

  return (
    <FlatList
      data={forms}
      style={{ paddingTop: 32 }}
      ItemSeparatorComponent={() => (
        <View style={{ height: 1, backgroundColor: Colors.dividerColor }} />
      )}
      renderItem={({ item }) => (
        <View
          className="flex-row gap-x-6 px-6 py-4"
          style={{ backgroundColor: Colors.background[5] }}
        >
          <View className="flex-1">
            <Text className="text-white font-poppins">{item.title}</Text>
            {item.description && (
              <Text
                className="text-sm font-poppins"
                style={{ color: Colors.grey }}
              >
                {item.description}
              </Text>
            )}
          </View>
          <Switch
            value={item.checked}
            thumbColor={
              Platform.OS === "android"
                ? color(Colors.primary).whiten(0.25).hexa()
                : undefined
            }
            trackColor={{
              true: Colors.primary,
              false: Platform.OS === "android" ? Colors.primary : undefined,
            }}
            onValueChange={async (value) => {
              setFieldValue(item.name, value);
            }}
          />
        </View>
      )}
    />
  );
}
