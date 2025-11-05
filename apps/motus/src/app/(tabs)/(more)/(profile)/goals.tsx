import z from "zod";
import assert from "assert";
import { format } from "util";
import { useFormik } from "formik";
import { useMemo, useState } from "react";
import { profileSchema } from "@motus/server";

import { useMutation } from "@tanstack/react-query";
import { Text, View, Pressable, FlatList } from "react-native";

import { Colors } from "../../../../constants";
import { withZodSchema } from "../../../../utils";
import Button from "../../../../components/Button";
import { authActions } from "../../../../store/auth";
import { useTRPC } from "../../../../providers/TRPCProvider";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { UnitSheet } from "../../../../components/bottom-sheets/UnitSheet";
import { ChoiceSheet } from "../../../../components/bottom-sheets/ChoiceSheet";

export default function GoalScreen() {
  const trpc = useTRPC();
  const [showWeeklyGoalModal, setShowWeeklyGoalModal] = useState(false);
  const [showGoalWeightModal, setShowGoalWeightModal] = useState(false);
  const [showCurrentWeightModal, setShowCurrentGoalModal] = useState(false);
  const [showActivityLevelModal, setShowActivityLevelModal] = useState(false);
  const [showStartingWeightModal, setShowStartingWeightModal] = useState(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  assert(user && user.type === "firebase");

  const { mutateAsync } = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess(data) {
        dispatch(authActions.updateUser(data));
      },
    }),
  );

  const { values, isValid, isSubmitting, handleSubmit, setFieldValue } =
    useFormik({
      validate: withZodSchema(
        z.object({ profile: profileSchema.pick({ goals: true }) }),
      ),
      initialValues: {
        profile: {
          goals: {
            startingWeight: {
              value: 0,
              unit: "kg" as const,
              date: Date.now(),
            },
            currentWeight: {
              value: user.profile.weight!.value,
              unit: user.profile.weight!.unit,
            },
            goalWeight: {
              value: 0,
              unit: "kg" as const,
            },
            weeklyGoal: {
              value: 0,
              unit: "kg" as const,
            },
            activityLevel: "very-active" as const,
            ...user.profile.goals,
          },
        },
      },
      async onSubmit(values) {
        return mutateAsync({ profile: { ...user.profile, ...values.profile } });
      },
    });

  const disabled = useMemo(
    () => !isValid || isSubmitting,
    [isValid, isSubmitting],
  );

  const profile: {
    title: string;
    value?: string | null;
    onPress?: () => void;
  }[] = useMemo(
    () => [
      {
        title: "Starting Weight",
        value: format(
          "%d %s",
          values.profile.goals?.startingWeight.value,
          values.profile.goals?.startingWeight.unit,
        ),
        onPress() {
          setShowStartingWeightModal(true);
        },
      },
      {
        title: "Current Weight",
        value: format(
          "%d %s",
          values.profile.goals?.currentWeight.value,
          values.profile.goals?.currentWeight.unit,
        ),
        onPress() {
          setShowCurrentGoalModal(true);
        },
      },
      {
        title: "Goal Weight",
        value: format(
          "%d %s",
          values.profile.goals?.goalWeight.value,
          values.profile.goals?.goalWeight.unit,
        ),
        onPress() {
          setShowGoalWeightModal(true);
        },
      },
      {
        title: "Weekly goal",
        value: format(
          "%d %s",
          values.profile.goals?.weeklyGoal.value,
          values.profile.goals?.weeklyGoal.unit,
        ),
        onPress() {
          setShowWeeklyGoalModal(true);
        },
      },
      {
        title: "Activity Level",
        value: values.profile.goals?.activityLevel,
        onPress() {
          setShowActivityLevelModal(true);
        },
      },
    ],
    [values.profile.goals],
  );

  return (
    <>
      <FlatList
        data={profile}
        className="flex-1 mt-8 px-6"
        ItemSeparatorComponent={() => (
          <View style={{ height: 0.5, backgroundColor: Colors.dividerColor }} />
        )}
        renderItem={({ item }) => (
          <Pressable
            className="flex-row py-4"
            onPress={item.onPress}
          >
            <Text
              className="flex-1"
              style={{ color: Colors.grey }}
            >
              {item.title}
            </Text>
            <Text className="text-white first-letter:capitalize">
              {item.value}
            </Text>
          </Pressable>
        )}
        ListFooterComponent={() => (
          <Button
            text="Update"
            disabled={disabled}
            submitting={isSubmitting}
            className="my-8"
            onPress={() => handleSubmit()}
          />
        )}
      />
      {showStartingWeightModal && (
        <UnitSheet
          {...values.profile.goals?.startingWeight}
          title="Starting Weight"
          units={["kg", "ibs"]}
          onClose={() => setShowStartingWeightModal(false)}
          onValueChange={(unit, value) => {
            setFieldValue("profile.goals.startingWeight.unit", unit);
            setFieldValue("profile.goals.startingWeight.value", value);
          }}
        />
      )}
      {showCurrentWeightModal && (
        <UnitSheet
          {...values.profile.goals?.currentWeight}
          title="Current Weight"
          units={["kg", "ibs"]}
          onClose={() => setShowCurrentGoalModal(false)}
          onValueChange={(unit, value) =>
            setFieldValue("profile.goals.currentWeight", { unit, value })
          }
        />
      )}
      {showGoalWeightModal && (
        <UnitSheet
          {...values.profile.goals?.goalWeight}
          title="Goal Weight"
          units={["kg", "ibs"]}
          onClose={() => setShowGoalWeightModal(false)}
          onValueChange={(unit, value) =>
            setFieldValue("profile.goals.goalWeight", { unit, value })
          }
        />
      )}

      {showWeeklyGoalModal && (
        <UnitSheet
          {...values.profile.goals?.weeklyGoal}
          title="Weekly Goal"
          units={["kg", "ibs"]}
          rulerPickerAttrs={{
            max: 240,
            min: -240,
          }}
          onClose={() => setShowWeeklyGoalModal(false)}
          onValueChange={(unit, value) =>
            setFieldValue("profile.goals.weeklyGoal", { unit, value })
          }
        />
      )}
      {showActivityLevelModal && (
        <ChoiceSheet
          title="Activity Level"
          value={values.profile.goals?.activityLevel}
          choices={[
            { label: "Not Very Active", value: "not-very-active" },
            { label: "Lightly Active", value: "lightly-active" },
            { label: "Active", value: "active" },
            { label: "Very Active", value: "very-active" },
          ]}
          onClose={() => setShowActivityLevelModal(false)}
          onValueChange={(value) =>
            setFieldValue("profile.goals.activityLevel", value)
          }
        />
      )}
    </>
  );
}
