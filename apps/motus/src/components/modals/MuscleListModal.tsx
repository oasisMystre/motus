import type z from "zod";
import { useEffect } from "react";

import type { muscleSelectSchema } from "@motus/server";
import { Pressable, Text, View, FlatList } from "react-native";
import { CheckIcon, HospitalIcon } from "phosphor-react-native";

import ModalDialog from "./ModalDialog";
import { Colors } from "../../constants";
import { useTRPCClient } from "../../providers/TRPCProvider";
import { useAppDispatch, useAppSelector } from "../../store";
import { equipmentSelectors, metadataActions } from "../../store/metadata";

type MuscleListModalProps = {
  title?: string;
  values?: z.infer<typeof muscleSelectSchema>[];
  onValueChange?: (value: z.infer<typeof muscleSelectSchema>[]) => void;
  checkType?: "multiple" | "single";
} & React.ComponentProps<typeof ModalDialog>;

export default function MuscleListModal({
  title,
  values,
  onValueChange,
  checkType,
  ...props
}: MuscleListModalProps) {
  const trpc = useTRPCClient();
  const dispatch = useAppDispatch();

  const { muscles } = useAppSelector((state) => state.metadata);
  const allMuscles = equipmentSelectors.selectAll(muscles);

  useEffect(() => {
    if (allMuscles.length < 1)
      trpc.muscle.list
        .query()
        .then((muscles) => dispatch(metadataActions.addMuscles(muscles)));
  }, [allMuscles]);

  return (
    <ModalDialog {...props}>
      <View className="flex-1">
        <View
          className="p-4 items-center justify-center border-b"
          style={{ borderColor: Colors.border[1] }}
        >
          <Text className="text-2xl text-white font-poppins">
            {title ? title : "Muscle Group"}
          </Text>
        </View>
        <FlatList
          data={allMuscles}
          keyExtractor={({ id }) => id}
          contentContainerStyle={{
            marginTop: 16,
            borderRadius: 16,
            marginHorizontal: 16,
            backgroundColor: Colors.background[3],
          }}
          renderItem={({ item }) => {
            const selected = values?.find((value) => value.id === item.id);

            return (
              <Pressable
                className="flex-row items-center gap-x-4 p-4 border-b"
                style={{
                  borderColor: Colors.border[1],
                  backgroundColor: selected
                    ? Colors.background[1]
                    : "transparent",
                }}
                onPress={(event) => {
                  if (onValueChange) {
                    if (checkType === "single") onValueChange([item]);
                    else {
                      if (!values) values = [];

                      if (selected)
                        values = values.filter((value) => value.id !== item.id);
                      else values.push(item);
                      onValueChange(values);
                    }
                    props.onRequestClose?.(event);
                  }
                }}
              >
                <View
                  className="size-16 items-center justify-center bg-white rounded-full"
                  style={{ backgroundColor: Colors.darkGray }}
                >
                  <HospitalIcon
                    size={32}
                    color={Colors.grey}
                    weight="duotone"
                  />
                </View>
                <Text className="flex-1 text-lg text-white font-poppins">
                  {item.name}
                </Text>
                {selected && <CheckIcon color={Colors.primary} />}
              </Pressable>
            );
          }}
        />
      </View>
    </ModalDialog>
  );
}
