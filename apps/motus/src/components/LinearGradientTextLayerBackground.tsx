import color from "color";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../constants";
import RepeatedText from "./RepeatedText";
import useDimensions from "../hooks/useDimensions";

type LinearGradientTextLayerBackgroundProps = {
  imageAttrs?: React.ComponentProps<typeof Image>;
};

export function LinearGradientTextLayerBackground({
  children,
  imageAttrs,
}: React.PropsWithChildren<LinearGradientTextLayerBackgroundProps>) {
  const { top } = useSafeAreaInsets();
  const { width, height } = useDimensions("window");

  return (
    <View style={{ flex: 1, width, height }}>
      <LinearGradient
        style={{
          inset: 0,
          position: "absolute",
        }}
        colors={["black", color(Colors.primary).darken(0.7).hexa(), "black"]}
      >
        <RepeatedText
          width={width}
          height={height}
          text={Array.from<string>({ length: 5 }).fill("Motus")}
          textAttrs={{ stroke: color(Colors.gray).alpha(0.5).hexa() }}
          style={{
            top,
            zIndex: 1,
            position: "absolute",
          }}
        />
      </LinearGradient>
      {imageAttrs && (
        <Image
          {...imageAttrs}
          style={[
            {
              top: 8,
              left: 0,
              right: 0,
              zIndex: 1,
              width: "100%",
              height: "70%",
              bottom: height / 3,
              objectFit: "contain",
              position: "absolute",
            },
            imageAttrs.style,
          ]}
        />
      )}
      <LinearGradient
        style={{
          height,
          gap: 24,
          left: 0,
          right: 0,
          zIndex: 10,
          position: "absolute",
          justifyContent: "flex-end",
          backgroundColor: color("black").darken(0).alpha(0.5).hexa(),
        }}
        locations={[0, 0.5, 0.7, 1]}
        colors={[
          color("black").darken(0).alpha(0.1).hexa(),
          color("black").darken(0).alpha(0.1).hexa(),
          color("black").darken(0).alpha(1).hexa(),
          color("black").darken(0).alpha(1).hexa(),
        ]}
      >
        {children}
      </LinearGradient>
    </View>
  );
}
