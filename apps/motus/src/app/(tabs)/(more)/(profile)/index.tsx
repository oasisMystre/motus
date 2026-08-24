import moment from "moment";
import { format } from "util";
import { useFormik } from "formik";
import { Image } from "expo-image";
import { type Link, router } from "expo-router";

import { useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { launchImageLibraryAsync } from "expo-image-picker";
import { CameraIcon, PencilSimpleIcon } from "phosphor-react-native";
import { Pressable, Text, View, FlatList, TextInput } from "react-native";

import { Colors } from "../../../../constants";
import Button from "../../../../components/Button";
import { useFirebase } from "../../../../providers";
import { uploadImageFromUri } from "../../../../utils";
import { useTRPC } from "../../../../providers/TRPCProvider";
import KeyboardView from "../../../../components/KeyboardView";
import DateTimePicker from "../../../../components/DateTimePicker";
import { UnitSheet } from "../../../../components/bottom-sheets/UnitSheet";
import { ChoiceSheet } from "../../../../components/bottom-sheets/ChoiceSheet";

type EditItem = {
  title: string;
  value?: string | null;
  ends?: {
    text?: string;
    editable?: boolean;
  };
  onPress?: () => void;
  onChange?: (value: string) => void;
  path?: React.ComponentProps<typeof Link>["href"];
};

export default function ProfileScreen() {
  const trpc = useTRPC();
  const {
    user,
    setUser,
    firebase: { storage },
  } = useFirebase();
  const [dateInput, setDateInput] = useState(false);
  const [genderInput, setGenderInput] = useState(false);
  const [avatarInput, setAvatarInput] = useState<string | null>(null);
  const [unitInput, setUnitInput] = useState<{
    title: string;
    units: string[];
    unit?: string;
    value?: number;
    onValueChange: (unit: string, value: number) => void;
  } | null>(null);

  const { mutateAsync } = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess(data) {
        setUser((previous) => (previous ? { ...previous, ...data } : null));
      },
    }),
  );

  const {
    isValid,
    isSubmitting,
    values,
    handleSubmit,
    setFieldValue,
    handleChange,
  } = useFormik({
    initialValues: user,
    async onSubmit(values) {
      if (avatarInput) {
        values.profile.avatar = await uploadImageFromUri(storage, avatarInput, {
          fileName: user.id,
        });
      }
      return mutateAsync(values);
    },
  });

  const disabled = useMemo(
    () => !isValid || isSubmitting,
    [isValid, isSubmitting],
  );

  const profile: EditItem[] = useMemo(
    () => [
      {
        title: "Name",
        value: values.name,
        onChange: handleChange("name"),
      },

      {
        title: "Sex",
        value: values.profile.gender,
        onPress() {
          setGenderInput(true);
        },
      },
      {
        title: "Age",
        value: format(
          "%d years",
          moment().diff(moment(values.profile.age), "years"),
        ),
        onPress: () => setDateInput(true),
      },
      {
        title: "Steps",
        value: values.profile.steps?.toString(),
        onChange: (value) => setFieldValue("profile.steps", parseFloat(value)),
      },
      {
        title: "Height",
        value: format(
          "%d %s",
          values.profile.height?.value,
          values.profile.height?.unit,
        ),
        onPress() {
          setUnitInput({
            ...values.profile.height,
            title: "Change Height",
            units: ["cm", "in"],
            onValueChange(unit, value) {
              setFieldValue("profile.height", { value, unit });
            },
          });
        },
      },
      {
        title: "Weight",
        value: format(
          "%d %s",
          values.profile.weight?.value,
          values.profile.weight?.unit,
        ),
        onPress() {
          setUnitInput({
            ...values.profile.weight,
            title: "Change Weight",
            units: ["kg", "ibs"],
            onValueChange(unit, value) {
              setFieldValue("profile.weight", { value, unit });
            },
          });
        },
      },
      {
        title: "Goals",
        value: "Check your goals",
        path: "/goals",
        onPress() {
          router.push("/goals");
        },
      },
    ],
    [
      setFieldValue,
      handleChange,
      values.name,
      values.profile.age,
      values.profile.gender,
      values.profile.steps,
      values.profile.height,
      values.profile.weight,
    ],
  );

  return (
    <>
      <KeyboardView>
        <View className="flex-1">
          <FlatList
            data={profile}
            style={{ flex: 1 }}
            ListHeaderComponent={() => (
              <Pressable
                className="self-center my-8"
                onPress={async () => {
                  const result = await launchImageLibraryAsync();
                  if (result.assets && result.assets.length > 0)
                    setAvatarInput(result.assets[0].uri);
                  else setAvatarInput(null);
                }}
              >
                <Image
                  source={avatarInput ? avatarInput : user.profile.avatar}
                  style={{
                    width: 96,
                    height: 96,
                    borderWidth: 2,
                    borderColor: Colors.primary,
                    borderRadius: 100,
                  }}
                />
                <View className="absolute right-0 bottom-0 bg-primary border-2 border-black p-2 rounded-full">
                  <CameraIcon
                    size={16}
                    color="white"
                  />
                </View>
              </Pressable>
            )}
            ItemSeparatorComponent={() => (
              <View
                style={{ height: 0.5, backgroundColor: Colors.dividerColor }}
              />
            )}
            renderItem={({ item }) => <ProfileEditItem item={item} />}
            ListFooterComponent={() => (
              <Button
                text="Save"
                className="my-8"
                disabled={disabled}
                submitting={isSubmitting}
                style={{
                  backgroundColor: isValid ? Colors.primary : Colors.grey,
                }}
                onPress={() => handleSubmit()}
              />
            )}
          />
        </View>
      </KeyboardView>
      {unitInput && (
        <UnitSheet
          {...unitInput}
          onClose={() => setUnitInput(null)}
        />
      )}
      {dateInput && (
        <DateTimePicker
          mode="date"
          value={values.profile.age!}
          onChange={(_, date) => setFieldValue("profile.age", date)}
          modalAttrs={{
            onClose() {
              setDateInput(false);
            },
          }}
        />
      )}
      {genderInput && (
        <ChoiceSheet
          value={values.profile.gender}
          title="Change Gender"
          choices={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ]}
          onClose={() => setGenderInput(false)}
          onValueChange={(value) => setFieldValue("profile.gender", value)}
        />
      )}
    </>
  );
}

const ProfileEditItem = ({ item }: { item: EditItem }) => {
  const inputRef = useRef<TextInput>(null);

  const onFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <Pressable className="flex-row py-2 items-center">
      <Text
        className="flex-1 font-poppins"
        style={{ color: Colors.grey }}
      >
        {item.title}
      </Text>
      <Pressable
        className="flex-row items-center"
        onPress={item.onPress}
      >
        {item.onChange ? (
          <TextInput
            ref={inputRef}
            focusable
            pointerEvents={item.onPress && "none"}
            className="text-white font-poppins"
            value={item.value?.toString()}
            onChangeText={item.onChange}
          />
        ) : (
          <Text className="text-white font-poppins">{item.value}</Text>
        )}
        <Pressable
          className="flex-row items-center gap-x-2 p-2"
          onPress={() => {
            if (item.path) router.push(item.path);
            else if (item.onPress) item.onPress();
            else onFocus();
          }}
        >
          {item.ends?.text && (
            <Text className="text-white">&nbsp;{item.ends?.text}</Text>
          )}
          <PencilSimpleIcon
            color={Colors.grey}
            size={16}
          />
        </Pressable>
      </Pressable>
    </Pressable>
  );
};
