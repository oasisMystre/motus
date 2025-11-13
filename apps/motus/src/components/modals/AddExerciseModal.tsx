import clsx from "clsx";
import type z from "zod";
import { format } from "util";
import { useMemo, useState } from "react";
import type { exerciseSelectSchema } from "@motus/server";
import { BarbellIcon, PlusIcon } from "phosphor-react-native";
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
import { useAppSelector } from "../../store";
import MuscleListModal from "./MuscleListModal";
import EquipmentListModal from "./EquipmentListModal";
import { exerciseSelector } from "../../store/exercise";
import CreateExerciseModal from "./CreateExerciseModal";

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
  const { bottom, top } = useSafeAreaInsets();
  const [showMuscles, setShowShowMuscles] = useState(false);
  const [showEquipments, setShowEquipments] = useState(false);
  const [selectedValues, setSelectedValues] = useState(values);
  const [showCreateExerciseModal, setShowCreateExerciseModal] = useState(false);

  const { exercises, customExercises } = useAppSelector(
    (state) => state.exercise,
  );
  const allExercises = exerciseSelector.selectAll(exercises);
  const allCustomExercises = exerciseSelector.selectAll(customExercises);
  const sections = useMemo(
    () => [
      {
        title: "Custom Exercises",
        custom: true,
        data: [...allCustomExercises],
      },
      { title: "Exercises", data: [...allExercises] },
    ],
    [allCustomExercises, allExercises],
  );

  return (
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
            renderItem={({ section: { custom, data }, item, index }) => {
              let exercises = [...selectedValues];

              const selected = exercises.find(
                (exercise) => exercise.id === item.id,
              );
              const exists = replace && selected;
              if (exists) return null;

              return (
                <Pressable
                  className="flex-row gap-x-4 px-2 py-4 border-b"
                  style={[
                    {
                      borderColor:
                        data.length > 0 && index < data.length - 1
                          ? Colors.border[1]
                          : undefined,
                    },
                    selected &&
                      !replace && [
                        {
                          borderStartWidth: 4,
                          borderStartColor: Colors.primary,
                        },
                      ],
                  ]}
                  onPress={(event) => {
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
                >
                  <View
                    className="size-16 items-center justify-center rounded-full"
                    style={{ backgroundColor: Colors.darkGray }}
                  >
                    <BarbellIcon
                      size={32}
                      color={Colors.grey}
                      weight="duotone"
                      style={{ transform: [{ rotate: "24deg" }] }}
                    />
                  </View>
                  <View className="">
                    <Text className="text-lg text-white font-poppins-medium">
                      {item.name}
                    </Text>
                    <View className="flex-row items-center gap-x-2">
                      {[item.primary_muscle_group, ...item.other_muscles].map(
                        (muscle, index) => (
                          <Text
                            key={index}
                            style={{ color: Colors.grey }}
                          >
                            {muscle.name}
                          </Text>
                        ),
                      )}
                      {custom && (
                        <View
                          className="px-2 py-1 rounded-md"
                          style={{ backgroundColor: Colors.background[3] }}
                        >
                          <Text style={{ color: Colors.grey }}>Custom</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            }}
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
      <CreateExerciseModal
        visible={showCreateExerciseModal}
        onRequestClose={() => setShowCreateExerciseModal(false)}
      />
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
