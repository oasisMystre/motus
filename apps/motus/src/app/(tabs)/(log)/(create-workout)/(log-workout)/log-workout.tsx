import Color from "color";
import moment from "moment";
import { useFormik } from "formik";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { TimerIcon } from "phosphor-react-native";
import { StyleSheet, View, Text } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { workoutLogInsertSchema } from "@motus/server";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

import { Colors } from "../../../../../constants";
import Input from "../../../../../components/Input";
import { withZodSchema } from "../../../../../utils";
import Button from "../../../../../components/Button";
import { useAppDispatch } from "../../../../../store";
import { logActions } from "../../../../../store/log";
import KeyboardView from "../../../../../components/KeyboardView";
import { useTRPCClient } from "../../../../../providers/TRPCProvider";

export default function LogWorkoutScreen() {
  const trpc = useTRPCClient();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [time, setTime] = useState({ minutes: "", seconds: "", hours: "" });

  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    validate: withZodSchema(workoutLogInsertSchema.omit({ user: true })),
    initialValues: {
      name: "",
      metadata: {
        reps: 0,
        note: undefined,
        duration: 0,
        weight: 0,
        sets: 0,
        volume: {
          value: 0,
          unit: "kg" as const,
        },
      },
    },
    async onSubmit(values, { resetForm }) {
      return trpc.log.workout.create
        .mutate(values)
        .then((data) => dispatch(logActions.addWorkout(data)))
        .then(() => {
          resetForm();
          setTime({ seconds: "", minutes: "", hours: "" });
          return router.dismissAll();
        });
    },
  });

  const disabled = useMemo(
    () => !isValid || isSubmitting,
    [isSubmitting, isValid],
  );

  useEffect(() => {
    const data = {
      seconds: parseFloat(time.seconds),
      minutes: parseFloat(time.minutes),
    };
    setFieldValue("metadata.duration", moment.duration(data).asMilliseconds());
  }, [time]);

  useEffect(() => {
    setFieldValue(
      "metadata.volume.value",
      values.metadata.reps * values.metadata.weight,
    );
  }, [values.metadata.reps, values.metadata.weight]);

  return (
    <KeyboardView className="px-6">
      <KeyboardAwareScrollView
        className="flex-1 pt-8"
        contentContainerClassName="flex-1 gap-y-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 flex-col gap-y-8">
          <Input
            error={touched.name && errors.name}
            label={t("log.create_workout.exercise_name_input.label")}
            labelAttrs={{ style: style.label }}
            inputAttrs={{
              value: values.name,
              placeholder: t(
                "log.create_workout.exercise_name_input.placeholder",
              ),
              onBlur: handleBlur("name"),
              onChangeText: handleChange("name"),
              style: {
                height: 48,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 8,
              },
            }}
          />
          <View className="flex-row gap-x-8">
            <Input
              label={t("log.create_workout.number_of_set_input.label")}
              style={style.inputContainer}
              labelAttrs={{ style: style.label }}
              error={touched.metadata?.sets && errors.metadata?.sets}
              LabelIcon={() => (
                <MaterialCommunityIcons
                  size={18}
                  name="repeat"
                  color={Colors.green[0]}
                />
              )}
              inputAttrs={{
                inputMode: "numeric",
                value: values.metadata.sets && String(values.metadata.sets),
                style: style.input,
                onBlur: handleBlur("metadata.sets"),
                onChangeText: (value) => setFieldValue("metadata.sets", value),
                focusStyle: style["input:focus"],
              }}
            />
            <Input
              label={t("log.create_workout.rep_per_set_input.label")}
              style={style.inputContainer}
              labelAttrs={{ style: style.label }}
              error={touched.metadata?.reps && errors.metadata?.reps}
              LabelIcon={() => (
                <MaterialCommunityIcons
                  size={18}
                  name="set-right"
                  color={Colors.fuchsia[0]}
                />
              )}
              inputAttrs={{
                style: style.input,
                inputMode: "numeric",
                onBlur: handleBlur("metadata.reps"),
                value: values.metadata.reps && String(values.metadata.reps),
                onChangeText: (value) => setFieldValue("metadata.reps", value),
                focusStyle: style["input:focus"],
              }}
            />
          </View>
          <View className="flex-row gap-x-8 ">
            <Input
              style={style.inputContainer}
              labelAttrs={{ style: style.label }}
              label={t("log.create_workout.weight_per_set_input.label")}
              error={touched.metadata?.weight && errors.metadata?.weight}
              LabelIcon={() => (
                <MaterialCommunityIcons
                  size={18}
                  name="weight-kilogram"
                  color={Colors.red[0]}
                />
              )}
              inputAttrs={{
                style: style.input,
                onBlur: handleBlur("metadata.weight"),
                keyboardType: "decimal-pad",
                value: values.metadata.weight && String(values.metadata.weight),
                onChangeText: (value) => {
                  const data = Number(value);
                  setFieldValue("metadata.weight", data);
                },
                focusStyle: style["input:focus"],
              }}
            />
            <View className="flex-1 gap-y-1">
              <View className="flex-row gap-x-2 items-center">
                <TimerIcon
                  size={18}
                  color={Colors.blue[0]}
                />
                <Text style={style.label}>
                  {t("log.create_workout.time_spent_input.label")}
                </Text>
              </View>
              <View className="flex-row items-center gap-x-4">
                <Input
                  style={style.inputContainer}
                  inputAttrs={{
                    placeholder: "MM",
                    style: style.input,
                    inputMode: "numeric",
                    focusStyle: style["input:focus"],
                    value: time.minutes && String(time.minutes),
                    onChangeText: (value) =>
                      setTime((time) => ({ ...time, minutes: value })),
                  }}
                />
                <Input
                  style={style.inputContainer}
                  inputAttrs={{
                    placeholder: "SS",
                    style: style.input,
                    inputMode: "numeric",
                    value: time.seconds && String(time.seconds),
                    focusStyle: style["input:focus"],
                    onBlur: handleBlur("metadata.duration"),
                    onChangeText: (value) =>
                      setTime((time) => ({ ...time, seconds: value })),
                  }}
                />
              </View>
            </View>
          </View>
          <Input
            style={style.inputContainer}
            labelAttrs={{ style: style.label }}
            label={t("log.create_workout.note_input.label")}
            error={touched.metadata?.note && errors.metadata?.note}
            LabelIcon={() => (
              <MaterialIcons
                size={18}
                name="note"
                color={Colors.red[1]}
              />
            )}
            inputAttrs={{
              value: values.metadata.note,
              focusStyle: style["input:focus"],
              onBlur: handleBlur("metadata.note"),
              onChangeText: handleChange("metadata.note"),
              style: [style.input, { height: 156, width: "100%" }],
            }}
          />
        </View>
        <Button
          disabled={disabled}
          submitting={isSubmitting}
          text={t("log.create_workout.action")}
          onPress={() => handleSubmit()}
          style={{ backgroundColor: isValid ? Colors.primary : Colors.grey }}
        />
      </KeyboardAwareScrollView>
    </KeyboardView>
  );
}

const style = StyleSheet.create({
  label: {
    color: Colors.grey,
    fontFamily: "Poppins_400Regular",
  },
  inputContainer: {
    flex: 1,
    width: "auto",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    borderColor: "transparent",
    backgroundColor: Color(Colors.darkGray).alpha(0.5).hexa(),
  },
  "input:focus": {
    borderColor: Colors.primary,
  },
});
