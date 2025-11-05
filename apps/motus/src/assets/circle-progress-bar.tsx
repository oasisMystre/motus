import { format } from "util";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  FeBlend,
  FeFlood,
  FeGaussianBlur,
  Filter,
  G,
  Rect,
} from "react-native-svg";

type CircleProgressBarProps = {
  percentage?: number;
  size?: number;
  backgroundColor?: string;
  glowColor?: string;
  trackColor?: string;
  progressColor?: string;
  innerColor?: string;
} & React.ComponentProps<typeof Svg>;

export default function CircleProgressBar({
  percentage = 75,
  size = 234,
  glowColor = "#9747FF",
  trackColor = "#8D8D8D",
  innerColor = "#2D2D2D",
  progressColor = "#EBEBEB",
  backgroundColor = "#353535",
  ...props
}: CircleProgressBarProps) {
  const center = size / 2;
  const padding = size * 0.05;
  const clipSize = size * 0.07;
  const strokeWidth = size * 0.05;
  const filterStdDev = size * 0.03;
  const filterPadding = size * 0.03;

  const bgRadius = (size - padding) / 2;
  const glowRadius = bgRadius * 0.95;
  const progressRadius = bgRadius * 0.8;
  const innerRadius = bgRadius * 0.69;

  const circumference = 2 * Math.PI * progressRadius;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const progressLength = (clampedPercentage / 100) * circumference;
  const strokeDashoffset = circumference - progressLength;

  const attrs = { width: size, height: size, ...props };

  return (
    <Svg
      {...attrs}
      fill="none"
      viewBox={format("0 0 %d %d", size, size)}
    >
      <Circle
        cx={center}
        cy={center}
        r={bgRadius}
        fill={backgroundColor}
      />
      <G filter="url(#filter0_f_306_2373)">
        <Circle
          cx={center}
          cy={center}
          r={glowRadius}
          fill={glowColor}
        />
      </G>
      <Circle
        fill="none"
        cx={center}
        cy={center}
        r={progressRadius}
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      <Circle
        fill="none"
        cx={center}
        cy={center}
        r={progressRadius}
        strokeLinecap="round"
        stroke={progressColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={format("rotate(-90 %d %d)", center, center)}
      />
      <Circle
        cx={center}
        cy={center}
        r={innerRadius}
        fill={innerColor}
      />
      <Defs>
        <Filter
          x={-filterPadding}
          y={-filterPadding}
          id="filter0_f_306_2373"
          filterUnits="userSpaceOnUse"
          width={size + filterPadding * 2}
          height={size + filterPadding * 2}
        >
          <FeFlood
            floodOpacity="0"
            result="BackgroundImageFix"
          />
          <FeBlend
            mode="normal"
            result="shape"
            in="SourceGraphic"
            in2="BackgroundImageFix"
          />
          <FeGaussianBlur
            stdDeviation={filterStdDev}
            result="effect1_foregroundBlur_306_2373"
          />
        </Filter>
        <ClipPath id="clip0_306_2373">
          <Rect
            width={clipSize}
            height={clipSize}
            fill="white"
            transform={format(
              "translate(%d %d)",
              center - clipSize / 2,
              center - clipSize / 2,
            )}
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
