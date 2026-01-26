import clsx from "clsx";
import type z from "zod";
import { v4 } from "uuid";
import { format } from "util";
import { useMemo, useState } from "react";
import { isString, useFormik } from "formik";
import { CameraIcon } from "phosphor-react-native";
import { launchImageLibraryAsync } from "expo-image-picker";
import { getStorage } from "@react-native-firebase/storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { exerciseInsertSchema, type exerciseSelectSchema } from "@motus/server";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  Modal,
  type GestureResponderEvent,
} from "react-native";

import Input from "../Input";
import Avatar from "../Avatar";
import { BackButton } from "../Header";
import SelectInput from "../SelectInput";
import KeyboardView from "../KeyboardView";
import { useFirebase } from "../../providers";
import { Colors } from "../../constants/colors";
import MuscleListModal from "../modals/MuscleListModal";
import { useTRPC } from "../../providers/TRPCProvider";
import MultipleSelectInput from "../MultipleSelectInput";
import EquipmentListModal from "../modals/EquipmentListModal";
import { ExerciseTypes } from "../../constants/exercise-types";
import { withZodSchema, uploadImageFromUri } from "../../utils";

type CreateExerciseModalProps = {
  initialValues?: z.infer<typeof exerciseSelectSchema>;
  onRequestClose?: (event?: GestureResponderEvent) => void;
  onSubmit?: (value: z.infer<typeof exerciseInsertSchema>) => void;
} & React.ComponentProps<typeof Modal>;

export default function CreateExerciseModal({
  initialValues,
  onSubmit,
  ...props
}: CreateExerciseModalProps) {
  const trpc = useTRPC();
  const { user } = useFirebase();
  const queryClient = useQueryClient();
  const { top } = useSafeAreaInsets();

  const [image, setImage] = useState<string | null>(null);
  const [showMuscles, setShowMuscles] = useState(false);
  const [showEquipments, setShowEquipments] = useState(false);
  const [showPrimaryMuscle, setShowPrimaryMuscle] = useState(false);

  const { data: equipments = [] } = useQuery(
    trpc.equipment.list.queryOptions(),
  );
  const { data: muscles = [] } = useQuery(trpc.muscle.list.queryOptions());
  const { mutateAsync } = useMutation(
    trpc.exercise.create.mutationOptions({
      onSuccess(exercise) {
        queryClient.setQueryData(
          trpc.exercise.list.queryKey(),
          (previousData) => {
            if (previousData) previousData.custom.push(exercise);

            return previousData;
          },
        );

        props?.onRequestClose?.();
      },
    }),
  );
  const { mutateAsync: updateExerciseAsync } = useMutation(
    trpc.exercise.update.mutationOptions({
      onSuccess(exercise) {
        queryClient.setQueryData(
          trpc.exercise.list.queryKey(),
          (previousData) => {
            if (previousData) {
              const index = previousData.custom.findIndex(
                (item) => item.id === exercise.id,
              );
              if (index > -1) previousData.custom[index] = exercise;
              else previousData.custom.push(exercise);
            }

            return previousData;
          },
        );

        props?.onRequestClose?.();
      },
    }),
  );

  const {
    values,
    errors,
    setFieldValue,
    isValid,
    isSubmitting,
    handleSubmit,
    handleChange,
    handleBlur,
    touched,
    setTouched,
  } = useFormik({
    validateOnMount: true,
    validate: withZodSchema(exerciseInsertSchema),
    initialValues: {
      name: initialValues?.name ?? "",
      metadata: initialValues?.metadata ?? {},
      equipment: initialValues?.equipment?.id,
      exercise_types: initialValues?.exercise_types ?? [],
      primary_muscle_group: initialValues?.primary_muscle_group.id,
      other_muscles: initialValues?.other_muscles.map((item) => item.id) ?? [],
    } as unknown as z.infer<typeof exerciseInsertSchema>,
    async onSubmit(values) {
      if (onSubmit) {
        onSubmit(values);
        props?.onRequestClose?.();
        return;
      }

      const id = values.id ?? v4();
      if (image) {
        values.image = await uploadImageFromUri(getStorage(), image, {
          fileName: format("%s/%s.jpg", user?.uid, id),
        });
      }
      if (initialValues)
        return updateExerciseAsync({
          ...values,
          id: initialValues.id,
        });
      else return mutateAsync({ ...values, id });
    },
  });

  const selectedEquipments = useMemo(() => {
    if (values.equipment) {
      const value = equipments.find(
        (equipment) => equipment.id === values.equipment,
      );
      if (value) return [value];
    }
    return [];
  }, [values.equipment, equipments]);
  const otherMuscles = useMemo(
    () =>
      values.other_muscles.map(
        (id) => muscles.find((muscle) => muscle.id === id)!,
      ),
    [values.other_muscles, muscles],
  );
  const primaryMuscleGroups = useMemo(() => {
    const value = muscles.find(
      (muscle) => muscle.id === values.primary_muscle_group,
    );
    if (value) return [value];
    return [];
  }, [values.primary_muscle_group, muscles]);

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
        <View className="flex-1 gap-y-8">
          <View className="flex flex-row items-center justify-between">
            <Pressable>
              <BackButton
                canGoBack
                navigation={{
                  goBack: (event) => {
                    if (event) props.onRequestClose?.(event);
                  },
                }}
              />
            </Pressable>
            <Text className="text-white text-lg font-poppins-semibold">
              {initialValues ? "Edit Exercise" : "Create Exercise"}
            </Text>
            <Pressable
              disabled={!isValid && isSubmitting}
              onPress={() => handleSubmit()}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: isValid ? Colors.primary : Colors.grey }}>
                  Save
                </Text>
              )}
            </Pressable>
          </View>
          <Pressable
            className="self-center size-28 border rounded-full"
            style={{ borderColor: Colors.gray }}
            onPress={async () => {
              if (!onSubmit) {
                const result = await launchImageLibraryAsync({
                  mediaTypes: "images",
                });
                const assets = result.assets;
                if (assets && assets.length > 0) {
                  setImage(assets[0].uri);
                } else setImage(null);
              }
            }}
          >
            <Avatar
              url={image}
              style={{ width: "100%", height: "100%", borderRadius: "100%" }}
            />
            <View className="size-12 absolute -right-4 bottom-4 items-center justify-center bg-primary rounded-full">
              <CameraIcon color="white" />
            </View>
          </Pressable>
          <View className="gap-y-8">
            <Input
              label="Exercise name"
              error={touched.name && errors.name}
              inputAttrs={{
                editable: !onSubmit,
                value: values.name,
                placeholder: "Aerobics",
                onBlur: handleBlur("name"),
                onChangeText: (value) => {
                  handleChange("name")(value);
                  setTouched({ name: true });
                },
              }}
            />
            <SelectInput
              label="Equipment"
              values={selectedEquipments}
              inputAttrs={{ placeholder: "Select" }}
              onPress={() => {
                if (!onSubmit) setShowEquipments(true);
              }}
              error={touched.equipment && errors?.equipment}
              onValueChange={([value]) => {
                setFieldValue("equipment", value?.id);
                setTouched({ metadata: { equipment: true } });
              }}
            />
            <SelectInput
              label="Primary Muscle Group"
              values={primaryMuscleGroups}
              inputAttrs={{ placeholder: "Select" }}
              onPress={() => {
                if (!onSubmit) setShowPrimaryMuscle(true);
              }}
              error={
                touched.primary_muscle_group && errors.primary_muscle_group
              }
              onValueChange={([value]) => {
                setTouched({
                  metadata: { primary_muscle_group: true },
                });
                setFieldValue("primary_muscle_group", value?.id);
              }}
            />
            <SelectInput
              label="Other Muscles (Optional)"
              values={otherMuscles}
              inputAttrs={{ placeholder: "Select" }}
              onPress={() => {
                if (!onSubmit) setShowMuscles(true);
              }}
              error={
                touched.other_muscles &&
                isString(errors.other_muscles) &&
                errors.other_muscles
              }
              onValueChange={(values) => {
                setFieldValue(
                  "other_muscles",
                  values.map((value) => value.id),
                );
                setTouched({
                  metadata: { other_muscles: true },
                });
              }}
            />
            <MultipleSelectInput
              label="Exercise Type"
              inputAttrs={{ placeholder: "Select" }}
              options={Object.keys(ExerciseTypes).map((name) => ({
                label: name,
                value: name,
              }))}
              values={values.exercise_types}
              onValueChange={(values) => {
                setFieldValue("exercise_types", values);
                setTouched({ metadata: { exercise_type: true } });
              }}
              error={
                touched.exercise_types &&
                isString(errors.exercise_types) &&
                errors?.exercise_types
              }
            />
          </View>
        </View>
      </KeyboardView>
      <MuscleListModal
        visible={showMuscles}
        values={otherMuscles}
        onDismiss={() => handleBlur("other_muscles")}
        onRequestClose={() => setShowMuscles(false)}
        onValueChange={(values) =>
          setFieldValue(
            "other_muscles",
            values.map((value) => value.id),
          )
        }
      />
      <MuscleListModal
        checkType="single"
        visible={showPrimaryMuscle}
        values={primaryMuscleGroups}
        onRequestClose={() => setShowPrimaryMuscle(false)}
        onDismiss={() => handleBlur("primary_muscle_group")}
        onValueChange={([value]) =>
          setFieldValue("primary_muscle_group", value.id)
        }
      />
      <EquipmentListModal
        checkType="single"
        visible={showEquipments}
        values={selectedEquipments}
        onDismiss={() => handleBlur("equipment")}
        onRequestClose={() => setShowEquipments(false)}
        onValueChange={([value]) => setFieldValue("equipment", value.id)}
      />
    </Modal>
  );
}
