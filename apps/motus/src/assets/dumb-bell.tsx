import { format } from "util";
import Svg, { Path } from "react-native-svg";

export default function DumbBell(
  props: React.ComponentProps<typeof Svg> & { size?: number },
) {
  const attrs = {
    size: 100,
    width: 100,
    height: 100,
    ...props,
  };

  return (
    <Svg
      fill="none"
      viewBox={format("0 0 %d %d", attrs.size, attrs.size)}
      {...attrs}
    >
      <Path
        d="M29.1667 28.3334C29.1667 25.342 26.3686 22.9167 22.9167 22.9167C19.465 22.9167 16.6667 25.342 16.6667 28.3334V71.6668C16.6667 74.6582 19.465 77.0834 22.9167 77.0834C26.3686 77.0834 29.1667 74.6582 29.1667 71.6668V28.3334Z"
        stroke="#3D07FF"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <Path
        d="M83.3335 28.3334C83.3335 25.342 80.5354 22.9167 77.0835 22.9167C73.6316 22.9167 70.8335 25.342 70.8335 28.3334V71.6668C70.8335 74.6582 73.6316 77.0834 77.0835 77.0834C80.5354 77.0834 83.3335 74.6582 83.3335 71.6668V28.3334Z"
        stroke="#3D07FF"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <Path
        d="M16.6667 38.8891C16.6667 35.8208 13.8685 33.3335 10.4167 33.3335C6.96498 33.3335 4.16675 35.8208 4.16675 38.8891V61.1112C4.16675 64.1795 6.96498 66.6668 10.4167 66.6668C13.8685 66.6668 16.6667 64.1795 16.6667 61.1112V38.8891Z"
        stroke="#3D07FF"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <Path
        d="M95.8335 38.8891C95.8335 35.8208 93.0354 33.3335 89.5835 33.3335C86.1316 33.3335 83.3335 35.8208 83.3335 38.8891V61.1112C83.3335 64.1795 86.1316 66.6668 89.5835 66.6668C93.0354 66.6668 95.8335 64.1795 95.8335 61.1112V38.8891Z"
        stroke="#3D07FF"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <Path
        d="M70.8334 56.25H29.1667V43.75H70.8334V56.25Z"
        stroke="#3D07FF"
        stroke-width="2"
        stroke-linejoin="round"
      />
    </Svg>
  );
}
