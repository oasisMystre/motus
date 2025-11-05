import clsx from "clsx";
import ms from "pretty-ms";
import { memo } from "react";
import { format } from "util";
import { Text, View } from "react-native";

import { Colors } from "../../constants";

type ListHeaderProps<
  T extends {
    sets: number;
    duration: number;
    volume: { value: number; unit: "kg" | "ibs" | "km" };
  },
> = {
  values: T;
  itemAttrs?: React.ComponentProps<typeof View>;
};

export const ListHeader = memo(
  <
    T extends {
      sets: number;
      duration: number;
      volume: { value: number; unit: "kg" | "ibs" | "km" };
    },
  >({
    values,
    itemAttrs,
  }: ListHeaderProps<T>) => {
    return (
      <View
        className="flex-row border-b py-4"
        style={{ borderColor: Colors.darkGray }}
      >
        <ListHeaderItem
          title="Duration"
          subtitle={ms(values.duration)}
          subtitleAttr={{ style: { color: Colors.primary } }}
          {...itemAttrs}
        />
        <ListHeaderItem
          title="Volume"
          subtitleAttr={{ style: { color: Colors.primary } }}
          subtitle={format("%d%s", values.volume.value, values.volume.unit)}
          {...itemAttrs}
        />
        <ListHeaderItem
          title="Sets"
          subtitle={values.sets}
          subtitleAttr={{ style: { color: Colors.primary } }}
          {...itemAttrs}
        />
      </View>
    );
  },
);

type ListHeaderItemProps = {
  title: string | React.ReactNode;
  subtitle: string | React.ReactNode;
  subtitleAttr?: React.ComponentProps<typeof Text>;
} & React.ComponentProps<typeof View>;

const ListHeaderItem = memo(
  ({ title, subtitle, subtitleAttr, ...props }: ListHeaderItemProps) => {
    return (
      <View
        {...props}
        className={clsx("flex-1 items-center justify-center", props.className)}
      >
        <Text
          className=" font-poppins"
          style={{ color: Colors.grey }}
        >
          {title}
        </Text>
        <Text
          {...subtitleAttr}
          className={clsx("font-poppins", subtitleAttr?.className)}
          style={[{ color: Colors.grey }, subtitleAttr?.style]}
        >
          {subtitle}
        </Text>
      </View>
    );
  },
);
