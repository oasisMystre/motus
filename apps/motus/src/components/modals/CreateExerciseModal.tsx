import clsx from "clsx";
import type z from "zod";
import { v4 } from "uuid";
import { format } from "util";
import { useMemo, useState } from "react";
import { isString, useFormik } from "formik";
import { CameraIcon } from "phosphor-react-native";
import { exerciseInsertSchema } from "@motus/server";
import { launchImageLibraryAsync } from "expo-image-picker";
import { getStorage } from "@react-native-firebase/storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import { Colors } from "../../constants/colors";
import MuscleListModal from "./MuscleListModal";
import EquipmentListModal from "./EquipmentListModal";
import { exerciseActions } from "../../store/exercise";
import MultipleSelectInput from "../MultipleSelectInput";
import { useTRPCClient } from "../../providers/TRPCProvider";
import { useAppDispatch, useAppSelector } from "../../store";
import { ExerciseTypes } from "../../constants/exercise-types";
import { withZodSchema, uploadImageFromUri } from "../../utils";
import { equipmentSelectors, muscleSelectors } from "../../store/metadata";

type CreateExerciseModalProps = {
  onRequestClose?: (event?: GestureResponderEvent) => void;
} & React.ComponentProps<typeof Modal>;

export default function CreateExerciseModal(props: CreateExerciseModalProps) {
  const trpc = useTRPCClient();
  const { top } = useSafeAreaInsets();

  const [image, setImage] = useState<string | null>(null);
  const [showMuscles, setShowMuscles] = useState(false);
  const [showEquipments, setShowEquipments] = useState(false);
  const [showPrimaryMuscle, setShowPrimaryMuscle] = useState(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { equipments, muscles } = useAppSelector((state) => state.metadata);

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
      name: "",
      other_muscles: [],
      exercise_types: [],
      metadata: {},
    } as unknown as z.infer<typeof exerciseInsertSchema>,
    async onSubmit(value) {
      const id = v4();
      if (image) {
        value.image = await uploadImageFromUri(getStorage(), image, {
          fileName: format("%s/%s.jpg", user?.uid, id),
        });
      }
      return trpc.exercise.create.mutate({ ...value, id }).then((exercise) => {
        dispatch(exerciseActions.addCustomExercise(exercise));
        props?.onRequestClose?.();
      });
    },
  });

  const selectedEquipments = useMemo(() => {
    const value = equipmentSelectors.selectById(equipments, values.equipment);
    if (value) return [value];
    return [];
  }, [values.equipment]);
  const otherMuscles = useMemo(
    () =>
      values.other_muscles.map((id) => muscleSelectors.selectById(muscles, id)),
    [values.other_muscles],
  );
  const primaryMuscleGroups = useMemo(() => {
    const value = muscleSelectors.selectById(
      muscles,
      values.primary_muscle_group,
    );
    if (value) return [value];
    return [];
  }, [values.primary_muscle_group]);

  return (
    <>
      <Modal
        animationType="slide"
        {...props}
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
                Create Exercise
              </Text>
              <Pressable
                disabled={!isValid && isSubmitting}
                onPress={() => handleSubmit()}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text
                    style={{ color: isValid ? Colors.primary : Colors.grey }}
                  >
                    Save
                  </Text>
                )}
              </Pressable>
            </View>
            <Pressable
              className="self-center size-28 border rounded-full"
              style={{ borderColor: Colors.gray }}
              onPress={async () => {
                const result = await launchImageLibraryAsync({
                  mediaTypes: "images",
                });
                const assets = result.assets;
                if (assets && assets.length > 0) {
                  setImage(assets[0].uri);
                } else setImage(null);
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
                onPress={() => setShowEquipments(true)}
                error={touched.equipment && errors?.equipment}
                onValueChange={([value]) => {
                  setFieldValue("equipmemt", value.id);
                  setTouched({ metadata: { equipment: true } });
                }}
              />
              <SelectInput
                label="Primary Muscle Group"
                values={primaryMuscleGroups}
                inputAttrs={{ placeholder: "Select" }}
                onPress={() => setShowPrimaryMuscle(true)}
                error={
                  touched.primary_muscle_group && errors.primary_muscle_group
                }
                onValueChange={([value]) => {
                  setTouched({
                    metadata: { primary_muscle_group: true },
                  });
                  setFieldValue("primary_muscle_group", value);
                }}
              />
              <SelectInput
                label="Other Muscles (Optional)"
                values={otherMuscles}
                inputAttrs={{ placeholder: "Select" }}
                onPress={() => setShowMuscles(true)}
                error={
                  touched.other_muscles &&
                  isString(errors.other_muscles) &&
                  errors.other_muscles
                }
                onValueChange={(values) => {
                  setFieldValue("other_muscles", values);
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
    </>
  );
}
