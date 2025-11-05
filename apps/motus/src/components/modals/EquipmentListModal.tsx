import type z from "zod";
import { useEffect } from "react";

import { BarbellIcon } from "phosphor-react-native";
import type { equipmentSelectSchema } from "@motus/server";
import { Pressable, Text, View, FlatList } from "react-native";

import ModalDialog from "./ModalDialog";
import { Colors } from "../../constants";
import { useAppDispatch, useAppSelector } from "../../store";
import { useTRPCClient } from "../../providers/TRPCProvider";
import { equipmentSelectors, metadataActions } from "../../store/metadata";

type EquipmentListModalProps = {
  values?: z.infer<typeof equipmentSelectSchema>[];
  checkType?: "multiple" | "single";
  onValueChange?: (values: z.infer<typeof equipmentSelectSchema>[]) => void;
} & React.ComponentProps<typeof ModalDialog>;

export default function EquipmentListModal({
  values,
  checkType,
  onValueChange,
  ...props
}: EquipmentListModalProps) {
  const trpc = useTRPCClient();
  const dispatch = useAppDispatch();
  const { equipments } = useAppSelector((state) => state.metadata);
  const allEquipments = equipmentSelectors.selectAll(equipments);

  useEffect(() => {
    if (allEquipments.length < 1)
      trpc.equipment.list
        .query()
        .then((equipments) =>
          dispatch(metadataActions.addEquipments(equipments)),
        )
        .catch(console.error);
  }, [allEquipments]);

  return (
    <ModalDialog {...props}>
      <View className="flex-1">
        <View
          className="p-4 items-center justify-center border-b"
          style={{ borderColor: Colors.border[1] }}
        >
          <Text className="text-2xl text-white font-poppins">Equipments</Text>
        </View>
        <FlatList
          data={allEquipments}
          contentContainerStyle={{
            marginTop: 16,
            borderRadius: 16,
            marginHorizontal: 16,
            backgroundColor: Colors.background[3],
          }}
          keyExtractor={({ id }) => id}
          renderItem={({ item }) => {
            const selected = values?.find((value) => item.id === value.id);

            return (
              <Pressable
                className="flex-row items-center gap-x-4 p-4 border-b"
                style={{
                  borderColor: Colors.border[1],
                  backgroundColor: selected
                    ? Colors.background[0]
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
                  <BarbellIcon
                    size={32}
                    color={Colors.grey}
                    weight="duotone"
                    style={{ transform: [{ rotate: "24deg" }] }}
                  />
                </View>
                <Text className="text-lg text-white font-poppins">
                  {item.name}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>
    </ModalDialog>
  );
}
