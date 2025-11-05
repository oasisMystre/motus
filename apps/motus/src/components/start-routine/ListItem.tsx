import type z from "zod";
import clsx from "clsx";
import Color from "color";
import ms from "pretty-ms";
import { memo } from "react";
import { format } from "util";
import { Pressable, Text } from "react-native";
import { View } from "react-native";
import type { FormikErrors } from "formik";
import type { exerciseSelectSchema } from "@motus/server";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  CheckIcon,
  DotsThreeIcon,
  MinusIcon,
  PlusIcon,
} from "phosphor-react-native";

import Input from "../Input";
import Button from "../Button";
import Avatar from "../Avatar";
import { Colors } from "../../constants";
import CheckboxInput from "../CheckboxInput";

type ListItemProps<
  T extends z.infer<typeof exerciseSelectSchema> & {
    sets: any[];
    note?: string | null;
    restTimer?: number | null;
  },
> = {
  item: T;
  index: number;
  onMenu?: () => void;
  errors: FormikErrors<{ metadata: { exercises: { sets: string[] }[] } }>;
  addSet: (index: number) => void;
  removeSet: (index: number) => void;
  setRestTimer?: (path: string) => void;
  onFieldChange: (path: string, value: unknown) => void;
};

export const ListItem = memo(
  <
    T extends z.infer<typeof exerciseSelectSchema> & {
      sets: any[];
      note?: string | null;
      restTimer?: number | null;
    },
  >({
    item,
    addSet,
    removeSet,
    onMenu,
    errors,
    onFieldChange,
    setRestTimer,
    index: itemIndex,
  }: ListItemProps<T>) => {
    return (
      <View className="gap-y-6">
        <View className="gap-y-2">
          <View className="flex-row gap-x-4 items-center">
            <Avatar
              url={item.image}
              className="size-14 bg-white rounded-full"
            />
            <Text className="flex-1 text-white text-lg font-poppins-medium">
              {item.name}
            </Text>
            <Pressable onPress={() => onMenu?.()}>
              <DotsThreeIcon color="white" />
            </Pressable>
          </View>
          <Input
            inputAttrs={{
              value: item.note,
              placeholder: "Add workout notes here",
              onChangeText: (value) =>
                onFieldChange(
                  format("metadata.exercises.%d.note", itemIndex),
                  value,
                ),
            }}
          />
        </View>
        <View className="gap-y-4">
          <View className="flex-row items-center gap-x-2">
            <MaterialCommunityIcons
              size={16}
              name="timer"
              color={Colors.primary}
            />
            <Pressable
              onPress={() =>
                setRestTimer?.(
                  format("metadata.exercises.%d.restTimer", itemIndex),
                )
              }
            >
              <Text className="text-primary">
                Rest Timer: {item.restTimer ? ms(item.restTimer) : "OFF"}
              </Text>
            </Pressable>
          </View>
          <View className="gap-y-2">
            <View className="flex-row gap-x-4 px-2">
              {item.sets.slice(0, 1).map((set) =>
                Object.entries(set).map(([key, value], index, entries) => {
                  return (
                    <TableHeaderTitle
                      key={index}
                      title={key}
                      value={value}
                      expand={index > 0}
                      className="-ml-2"
                    />
                  );
                }),
              )}
            </View>
            <View>
              {item.sets.map((set, setIndex) => {
                let error;
                const exerciseErrors = errors.metadata?.exercises?.[itemIndex];
                if (typeof exerciseErrors === "object")
                  error = exerciseErrors.sets?.[setIndex];

                return (
                  <TableCell
                    set={set}
                    key={setIndex}
                    error={error}
                    setIndex={setIndex}
                    itemIndex={itemIndex}
                    onFieldChange={onFieldChange}
                  />
                );
              })}
            </View>
          </View>
        </View>
        <View className="flex-row gap-x-4">
          <Button
            text="Add Set"
            icon={
              <PlusIcon
                size={16}
                color="white"
              />
            }
            style={{
              flex: 1,
              paddingVertical: 12,
              backgroundColor: Colors.background[0],
            }}
            onPress={() => addSet(itemIndex)}
          />
          {item.sets.length > 1 && (
            <Button
              text="Remove Set"
              icon={<MinusIcon color="white" />}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: Colors.background[0],
              }}
              onPress={() => removeSet(itemIndex)}
            />
          )}
        </View>
      </View>
    );
  },
);

type TableHeaderTitleProps<
  T extends React.ElementType,
  U extends number | string | boolean,
> = {
  expand?: boolean;
  as?: T;
  title: string;
  value: U;
  innerAttrs?: T extends boolean
    ? React.ComponentProps<typeof CheckIcon>
    : React.ComponentProps<typeof Text>;
} & React.ComponentProps<T>;

const TableHeaderTitle = memo(
  <T extends React.ElementType, U extends number | string | boolean>({
    value,
    title,
    innerAttrs,
    as = View,
    expand,
    ...props
  }: TableHeaderTitleProps<T, U>) => {
    const Wrapper = as;
    const check = typeof value === "boolean";
    return (
      <Wrapper
        {...props}
        className={clsx(!check && expand && clsx("flex-1", props.className))}
      >
        {check ? (
          <CheckIcon
            color="white"
            size={16}
            {...innerAttrs}
          />
        ) : (
          <Text
            {...innerAttrs}
            className={clsx("text-white uppercase", innerAttrs?.className)}
          >
            {title}
          </Text>
        )}
      </Wrapper>
    );
  },
);

type TableCellProps = {
  error?: string;
  itemIndex: number;
  setIndex: number;
  onFieldChange: (path: string, value: unknown) => void;
  set: any;
};

const TableCell = memo(
  ({ error, set, itemIndex, setIndex, onFieldChange }: TableCellProps) => {
    return (
      <View
        className="flex-row gap-x-4 items-center px-2"
        style={{
          backgroundColor: set.completed
            ? Color(error ? Colors.red[2] : Colors.green[1])
                .darken(0.5)
                .alpha(0.4)
                .hexa()
            : setIndex % 2 === 1
              ? Colors.background[3]
              : undefined,
        }}
      >
        {Object.entries(set).map(([key, value], valueIndex) => {
          const check = typeof value === "boolean";
          const editable = !["set", "previous"].includes(key);
          const onChange = (value: unknown) =>
            onFieldChange(
              format(
                "metadata.exercises.%d.sets.%d.%s",
                itemIndex,
                setIndex,
                key,
              ),
              value,
            );

          return (
            <View
              key={valueIndex}
              className={clsx(!check && valueIndex > 0 && "flex-1")}
            >
              <TableHeaderTitle
                value={value}
                title={key}
                expand={valueIndex > 0}
                style={{ opacity: 0, height: 0 }}
              />

              {check ? (
                <CheckboxInput
                  showCheck
                  value={value}
                  key={valueIndex}
                  style={{ marginTop: 4 }}
                  onChange={onChange}
                  checkContainerStyle={(value) => ({
                    borderColor: "transparent",
                    backgroundColor: value ? Colors.green[1] : Colors.grey,
                  })}
                />
              ) : (
                <Input
                  key={valueIndex}
                  inputAttrs={{
                    editable,
                    placeholder: "_",
                    className: "text-sm",
                    onChangeText: onChange,
                    value:
                      value === "n" ? String(setIndex + 1) : value?.toString(),
                    placeholderTextColor: set.completed ? "white" : Colors.grey,
                    style: {
                      borderWidth: 0,
                      borderColor: "transparent",
                    },
                    onPress: () => {
                      if (key === "previous")
                        Object.entries(set).map(([key, value]) => {
                          onFieldChange(
                            format(
                              "metadata.exercises.%d.sets.%d.%s",
                              itemIndex,
                              setIndex,
                              key,
                            ),
                            value,
                          );
                        });
                    },
                  }}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  },
);
