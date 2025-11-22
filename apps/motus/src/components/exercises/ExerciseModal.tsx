import clsx from "clsx";
import type z from "zod";
import { format } from "util";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "phosphor-react-native";
import { useMemo, useRef, useState } from "react";
import type { exerciseSelectSchema } from "@motus/server";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Modal,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Button from "../Button";
import { BackButton } from "../Header";
import SearchInput from "../SearchInput";
import { Colors } from "../../constants";
import KeyboardView from "../KeyboardView";
import ExerciseListItem from "./ExerciseListItem";
import { useTRPC } from "../../providers/TRPCProvider";
import CreateExerciseModal from "./ExerciseCreateModal";
import MuscleListModal from "../modals/MuscleListModal";
import EquipmentListModal from "../modals/EquipmentListModal";
import { ExerciseConfirmDeletion } from "./ExerciseConfirmDeletion";

type AddExerciseModalProps = {
  replace?: boolean;
  values: z.infer<typeof exerciseSelectSchema>[];
  onValueChange: (values: z.infer<typeof exerciseSelectSchema>[]) => void;
} & React.ComponentProps<typeof Modal>;

export default function AddExerciseModal({
  replace,
  values,
  onValueChange,
  ...props
}: AddExerciseModalProps) {
  const trpc = useTRPC();
  const { bottom, top } = useSafeAreaInsets();
  const [showMuscles, setShowShowMuscles] = useState(false);
  const [showEquipments, setShowEquipments] = useState(false);
  const [selectedValues, setSelectedValues] = useState(values);
  const [showCreateExerciseModal, setShowCreateExerciseModal] = useState(false);
  const [showDeleteExerciseModal, setShowDeleteExerciseModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<
    z.infer<typeof exerciseSelectSchema> | undefined
  >(undefined);

  const { data } = useQuery(trpc.exercise.list.queryOptions());

  const sections = useMemo(
    () => [
      {
        title: "Custom Exercises",
        custom: true,
        data: data ? data.custom : [],
      },
      { title: "Exercises", data: data ? data.default : [] },
    ],
    [data],
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
        <View className="flex-1 gap-y-8">
          <View className="gap-y-4">
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
                {replace ? "Replace" : "Add"} Exercises
              </Text>
              <Pressable onPress={() => setShowCreateExerciseModal(true)}>
                <Text className="text-primary font-poppins">Create</Text>
              </Pressable>
            </View>
            <View className="gap-y-4">
              <SearchInput
                inputAttrs={{
                  placeholder: "Search Exercises",
                }}
              />
              <View className="flex-row gap-x-8">
                <Pressable
                  style={style.button}
                  onPress={() => setShowEquipments(true)}
                >
                  <Text className="text-white font-poppins">All Equipment</Text>
                </Pressable>
                <Pressable
                  style={style.button}
                  onPress={() => setShowShowMuscles(true)}
                >
                  <Text className="text-white font-poppins">All Muscle</Text>
                </Pressable>
              </View>
            </View>
          </View>
          <SectionList
            sections={sections}
            stickyHeaderHiddenOnScroll
            keyExtractor={({ id }) => id}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section: { title, custom, data } }) => (
              <>
                {data.length > 0 && (
                  <View className="flex-row">
                    <Text
                      className="flex-1 text-white font-poppins"
                      style={{ color: Colors.grey }}
                    >
                      {title} {custom && format("(%d/%d)", data.length, 5)}
                    </Text>
                    {custom && (
                      <Pressable>
                        <Text className="text-primary font-poppins-medium">
                          Unlock more
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </>
            )}
            renderItem={({ section: { custom, data }, item, index }) => (
              <ExerciseListItem
                index={index}
                value={item}
                custom={custom}
                replace={replace}
                size={data.length}
                values={selectedValues}
                onEdit={() => {
                  setSelectedExercise(item);
                  setShowCreateExerciseModal(true);
                }}
                onDelete={() => {
                  setSelectedExercise(item);
                  setShowDeleteExerciseModal(true);
                }}
                onPress={(event, selected) => {
                  let exercises = [...selectedValues];
                  if (replace) {
                    onValueChange([item]);
                    props.onRequestClose?.(event);
                  }
                  if (selected)
                    exercises = exercises.filter(
                      (exercise) => exercise.id !== item.id,
                    );
                  else exercises.push(item);

                  setSelectedValues(exercises);
                }}
              />
            )}
          />
          {!replace && (
            <View
              className="absolute bottom-0 inset-x-0"
              style={{ paddingBottom: bottom, marginHorizontal: 16 }}
            >
              {selectedValues.length > 0 && (
                <Button
                  icon={<PlusIcon color="white" />}
                  text={format(
                    "Add %d %s",
                    selectedValues.length,
                    selectedValues.length > 1 ? "Exercises" : "Exercise",
                  )}
                  onPress={(event) => {
                    props.onRequestClose?.(event);
                    onValueChange(selectedValues);
                  }}
                />
              )}
            </View>
          )}
        </View>
      </KeyboardView>
      <EquipmentListModal
        visible={showEquipments}
        onRequestClose={() => setShowEquipments(false)}
      />
      <MuscleListModal
        visible={showMuscles}
        onRequestClose={() => setShowShowMuscles(false)}
      />
      {selectedExercise && (
        <ExerciseConfirmDeletion
          exercise={selectedExercise}
          visible={showDeleteExerciseModal}
          onRequestClose={() => {
            setSelectedExercise(undefined);
            setShowDeleteExerciseModal(false);
          }}
        />
      )}
      {showCreateExerciseModal && (
        <CreateExerciseModal
          initialValues={selectedExercise}
          visible={showCreateExerciseModal}
          onRequestClose={() => {
            setSelectedExercise(undefined);
            setShowCreateExerciseModal(false);
          }}
        />
      )}
    </Modal>
  );
}

const style = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background[3],
  },
});
