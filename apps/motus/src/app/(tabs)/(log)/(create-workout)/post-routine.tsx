import clsx from "clsx";
import moment from "moment";
import { Image } from "expo-image";
import { useFormik } from "formik";
import { Ionicons } from "@expo/vector-icons";
import { ImageIcon } from "phosphor-react-native";
import { router, useNavigation } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { launchImageLibraryAsync } from "expo-image-picker";
import { routineLogInsertSchema, postInsertSchema } from "@motus/server";
import {
  Pressable,
  Text,
  ScrollView,
  View,
  ActivityIndicator,
} from "react-native";

import { Colors } from "../../../../constants";
import Input from "../../../../components/Input";
import { logActions } from "../../../../store/log";
import { useFirebase } from "../../../../providers";
import { postActions } from "../../../../store/post";
import { routineActions } from "../../../../store/routine";
import KeyboardView from "../../../../components/KeyboardView";
import { ListHeader } from "../../../../components/start-routine";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { useTRPCClient } from "../../../../providers/TRPCProvider";
import DateTimePicker from "../../../../components/DateTimePicker";
import { uploadImageFromUri, withZodSchema } from "../../../../utils";
import {
  DiscardWorkoutModal,
  SelectPostVisibilityModal,
} from "../../../../components/create-routine";

export default function PostRoutineScreen() {
  const trpc = useTRPCClient();
  const navigation = useNavigation();
  const {
    firebase: { storage },
  } = useFirebase();
  const [image, setImage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showSelectVisibilityModal, setShowSelectVisibilityModal] =
    useState(false);

  const dispatch = useAppDispatch();
  const form = useAppSelector((state) => state.form.workoutLog);

  const {
    values,
    isValid,
    isSubmitting,
    handleSubmit,
    handleChange,
    handleBlur,
    setFieldValue,
  } = useFormik({
    validateOnMount: true,
    validate: withZodSchema(
      postInsertSchema.omit({
        user: true,
        log: true,
        metadata: true,
      }),
    ),
    initialValues: {
      ...form,
      images: undefined as string[] | undefined,
      description: undefined,
      createdAt: new Date(),
      name: form?.title || form?.routine.name || "",
      title: form?.title || form?.routine.name || "",
      visibility: "everyone" as const,
    },
    async onSubmit(values) {
      const [routine, log] = await Promise.all([
        trpc.routine.update.mutate({
          id: values.routine?.id,
          metadata: { exercises: values.metadata!.exercises },
        }),
        trpc.log.routine.create.mutate(
          routineLogInsertSchema
            .omit({ user: true })
            .pick({ metadata: true, routine: true, name: true })
            .parse({ ...values, routine: values?.routine?.id, metadata: form }),
        ),
      ]);

      dispatch(
        logActions.addRoutineLog(log),
        routineActions.updateRoutine({
          id: routine.id,
          changes: routine,
        }),
      );

      if (image)
        values.images = [
          await uploadImageFromUri(storage, image, { fileName: log.id }),
        ];

      const post = await trpc.post.create.mutate(
        postInsertSchema.omit({ user: true }).parse({
          ...values,
          log: log.id,
        }),
      );

      dispatch(postActions.addPost(post));

      return router.replace("/(tabs)/(home)");
    },
  });

  const disabled = useMemo(
    () => !isValid || isSubmitting,
    [isSubmitting, isValid],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          disabled={disabled}
          onPress={() => handleSubmit()}
        >
          {isSubmitting ? (
            <ActivityIndicator />
          ) : (
            <Text
              className="font-poppins"
              style={{ color: isValid ? Colors.primary : Colors.grey }}
            >
              Save
            </Text>
          )}
        </Pressable>
      ),
    });

    return () => navigation.setOptions({ headerRight: undefined });
  }, [navigation, form, isSubmitting]);

  return (
    form && (
      <>
        <KeyboardView>
          <ScrollView
            className="gap-y-8"
            contentContainerClassName="gap-y-4"
          >
            <Input
              inputAttrs={{
                value: values.title,
                placeholder: "Workout title",
                onBlur: handleBlur("title"),
                onChangeText: handleChange("title"),
                style: { fontSize: 24, fontFamily: "Poppins_500Medium" },
              }}
            />
            <ListHeader
              values={form}
              itemAttrs={{ style: { alignItems: "flex-start" } }}
            />
            <View>
              <Input
                label="When"
                inputAttrs={{
                  editable: false,
                  pointerEvents: "none",
                  value: moment(values.createdAt).format("Do MMM YYYY, HH:m A"),
                  style: { color: Colors.primary },
                }}
                InputWrapper={({ children }) => (
                  <Pressable onPress={() => setShowDatePicker(true)}>
                    {children}
                  </Pressable>
                )}
              />
            </View>
            <Pressable
              className="items-center justify-center gap-y-2 py-4"
              style={{ borderWidth: 1, borderBottomColor: Colors.darkGray }}
              onPress={async () => {
                const result = await launchImageLibraryAsync({
                  allowsEditing: true,
                  mediaTypes: ["images", "videos"],
                });
                const assets = result.assets;
                if (assets && assets.length > 0) setImage(assets[0].uri);
              }}
            >
              <View
                className={clsx(
                  "self-center size-32 items-center justify-center rounded-md overflow-hidden",
                  !image && "border-dashed",
                )}
                style={[
                  !image && { borderWidth: 2, borderColor: Colors.border[2] },
                ]}
              >
                {image ? (
                  <Image
                    source={image}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <ImageIcon color="white" />
                )}
              </View>
              <Text className="text-white font-poppins-medium">
                Add a photo or video
              </Text>
            </Pressable>
            <View>
              <Input
                label="Description"
                inputAttrs={{
                  value: values.description,
                  multiline: true,
                  numberOfLines: 2,
                  onBlur: handleBlur("description"),
                  onChangeText: handleChange("description"),
                  placeholder:
                    "Tell use how did your workout go? Drop some notes here",
                }}
              />
            </View>
            <View
              className="flex-row items-center py-2"
              style={{ borderWidth: 1, borderBottomColor: Colors.darkGray }}
            >
              <Text className="flex-1 text-white font-poppins">Visibility</Text>
              <Pressable
                className="flex-row items-center gap-x-1 p-2"
                onPress={() => setShowSelectVisibilityModal(true)}
              >
                <Text
                  className="font-poppins capitalize"
                  style={{ color: Colors.grey }}
                >
                  {values.visibility}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  color={Colors.grey}
                  size={18}
                />
              </Pressable>
            </View>
            <View className="items-center justify-center">
              <Pressable
                className="p-2"
                onPress={() => setShowDiscardModal(true)}
              >
                <Text
                  className="font-poppins"
                  style={{ color: Colors.red[3] }}
                >
                  Discard Workout
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardView>
        {showDatePicker && (
          <DateTimePicker
            value={values.createdAt}
            onChange={(_, value) => setFieldValue("createdAt", value)}
            modalAttrs={{
              onClose: () => setShowDatePicker(false),
            }}
          />
        )}
        {showDiscardModal && (
          <DiscardWorkoutModal
            visible={showDiscardModal}
            onRequestClose={() => setShowDiscardModal(false)}
          />
        )}
        {showSelectVisibilityModal && (
          <SelectPostVisibilityModal
            value={values.visibility}
            onChange={(value) => setFieldValue("visibility", value)}
            onClose={() => setShowSelectVisibilityModal(false)}
          />
        )}
      </>
    )
  );
}
