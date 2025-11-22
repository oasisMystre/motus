import type z from "zod";
import clsx from "clsx";
import moment from "moment";
import { Image } from "expo-image";
import { useFormik } from "formik";
import { useMemo, useState } from "react";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ImageIcon } from "phosphor-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { launchImageLibraryAsync } from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  routineLogInsertSchema,
  postInsertSchema,
  type exerciseSelectSchema,
} from "@motus/server";
import {
  Modal,
  Pressable,
  Text,
  ScrollView,
  View,
  ActivityIndicator,
} from "react-native";

import Input from "../Input";
import { BackButton } from "../Header";
import { Colors } from "../../constants";
import KeyboardView from "../KeyboardView";
import { logActions } from "../../store/log";
import { useAppDispatch } from "../../store";
import { useFirebase } from "../../providers";
import { ListHeader } from "../start-routine";
import DateTimePicker from "../DateTimePicker";
import { useTanstackStore } from "../../hooks/useTanstackStore";
import { withZodSchema, uploadImageFromUri } from "../../utils";
import { useTRPC, useTRPCClient } from "../../providers/TRPCProvider";
import {
  DiscardWorkoutModal,
  SelectPostVisibilityModal,
} from "../create-routine";

export type WorkoutLog = {
  type: string;
  title: string;
  routine: {
    id: string;
    name: string;
  };
  sets: number;
  volume: {
    value: number;
    unit: "kg" | "ibs" | "km";
  };
  duration: number;
  metadata: {
    exercises: (z.infer<typeof exerciseSelectSchema> & {
      sets: { [key: string]: any; completed: boolean }[];
    })[];
  };
};

type PostRoutineModalProps = {
  onRequestClose?: () => void;
  workoutLog: WorkoutLog;
} & React.ComponentProps<typeof Modal>;

export default function PostRoutineModal({
  workoutLog,
  ...props
}: PostRoutineModalProps) {
  const trpc = useTRPC();
  const navigation = useNavigation();
  const trpcClient = useTRPCClient();
  const queryClient = useQueryClient();
  const { top } = useSafeAreaInsets();
  const {
    firebase: { storage },
  } = useFirebase();

  const [image, setImage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showSelectVisibilityModal, setShowSelectVisibilityModal] =
    useState(false);

  const dispatch = useAppDispatch();
  const { update: updateRoutine } = useTanstackStore(
    queryClient,
    trpc.routine.list.queryKey(),
  );
  const { update: updatePost } = useTanstackStore(
    queryClient,
    trpc.post.list.queryKey(),
    (post) => post.id,
  );

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
        routineLog: true,
        metadata: true,
      }),
    ),
    initialValues: {
      ...workoutLog,
      images: undefined as string[] | undefined,
      description: undefined,
      createdAt: new Date(),
      name: workoutLog?.title || workoutLog?.routine.name || "",
      title: workoutLog?.title || workoutLog?.routine.name || "",
      visibility: "everyone" as const,
    },
    async onSubmit(values) {
      console.log(values.metadata!.exercises.map((e) => e.sets));
      const [routine, log] = await Promise.all([
        trpcClient.routine.update.mutate({
          id: values.routine?.id,
          metadata: { exercises: values.metadata!.exercises },
        }),
        trpcClient.log.routine.create.mutate(
          routineLogInsertSchema
            .omit({ user: true })
            .pick({ metadata: true, routine: true, name: true })
            .parse({
              ...values,
              routine: values?.routine?.id,
              metadata: workoutLog,
            }),
        ),
      ]);

      updateRoutine(routine);
      dispatch(logActions.addRoutineLog(log));

      if (image)
        values.images = [
          await uploadImageFromUri(storage, image, { fileName: log.id }),
        ];

      const post = await trpcClient.post.create.mutate(
        postInsertSchema.omit({ user: true }).parse({
          ...values,
          routineLog: log.id,
        }),
      );

      updatePost(post);

      navigation.goBack();
    },
  });

  const disabled = useMemo(
    () => !isValid || isSubmitting,
    [isSubmitting, isValid],
  );

  return (
    <Modal
      {...props}
      animationType="slide"
      backdropColor={Colors.backgroundColor}
    >
      <KeyboardView
        className={clsx("flex-1", props.className)}
        style={{
          paddingTop: top,
          paddingHorizontal: 16,
          backgroundColor: Colors.backgroundColor,
        }}
      >
        <View className="gap-y-4">
          <View className="flex flex-row items-center justify-between">
            <Pressable>
              <BackButton
                canGoBack
                icon={
                  <Ionicons
                    name="close"
                    color="white"
                    size={24}
                  />
                }
                navigation={{
                  goBack: (event) => {
                    if (event) props.onRequestClose?.(event);
                  },
                }}
              />
            </Pressable>
            <Text className="text-white text-lg font-poppins-semibold">
              Create Exercise
            </Text>
            <Pressable
              disabled={disabled}
              onPress={() => handleSubmit()}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  className="font-poppins"
                  style={{ color: isValid ? Colors.primary : Colors.grey }}
                >
                  Save
                </Text>
              )}
            </Pressable>
          </View>

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
              values={workoutLog}
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
        </View>
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
          onClose={() => {
            setShowDiscardModal(false);
            props.onRequestClose?.();
          }}
        />
      )}
      {showSelectVisibilityModal && (
        <SelectPostVisibilityModal
          value={values.visibility}
          onChange={(value) => setFieldValue("visibility", value)}
          onClose={() => setShowSelectVisibilityModal(false)}
        />
      )}
    </Modal>
  );
}
