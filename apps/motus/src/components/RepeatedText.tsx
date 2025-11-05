import { format } from "util";
import { Svg, Text } from "react-native-svg";

type RepeatedTextProps = {
  width: number;
  height: number;
  text: string[];
  textAttrs: Partial<React.ComponentProps<typeof Text>> & { stroke: string };
} & React.ComponentProps<typeof Svg>;

export default function RepeatedText({
  width,
  height,
  text,
  textAttrs,
  ...svgAttrs
}: RepeatedTextProps) {
  const fontSize = width / (text.length * 0.59);

  const textProps = {
    strokeWidth: 1,
    fontWeight: "bold",
    fill: "transparent",
    textAnchor: "middle",
    fontSize: width / (5 * 0.7),
    fontFamily: "Poppins_700Bold",
    ...textAttrs,
  } as const;

  return (
    <Svg
      width={width}
      height={height}
      preserveAspectRatio="xMinYMin meet"
      viewBox={format("0 0 %d %d", width, height)}
      {...svgAttrs}
    >
      {text.map((text, index) => (
        <Text
          key={index}
          x="50%"
          y={(fontSize - (index > 0 ? 40 : 48)) * (index + 1)}
          {...textProps}
        >
          {text}
        </Text>
      ))}
    </Svg>
  );
}
