import { View } from "react-native";
import Svg, { Circle, Defs, ForeignObject, Mask, Rect } from "react-native-svg";

export default function Spinner() {
  return (
    <Svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
    >
      <Circle
        cx="36"
        cy="36"
        r="36"
        fill="#D9D9D9"
      />

      <Defs>
        <Mask id="hole">
          <Rect
            width="100%"
            height="100%"
            fill="white"
          />
          <Circle
            cx="36"
            cy="36"
            r="26"
            fill="black"
          />
        </Mask>
      </Defs>
      <ForeignObject
        x="0"
        y="0"
        width="72"
        height="72"
        mask="url(#hole)"
      >
        <View
          style={{
            width: 72,
            height: 72,
            backgroundColor:
              "conic-gradient(from 90deg, #B860E7 0deg, rgba(184,96,231,0) 360deg)",
            borderRadius: "50%",
          }}
        />
      </ForeignObject>
      <Circle
        cx="66.9"
        cy="36.9"
        r="5.1"
        fill="#B860E7"
      />
    </Svg>
  );
}
