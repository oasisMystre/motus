import assert from "assert";
import { Text } from "react-native";
import type { IMessage } from "../../store/message";

export function MessageText({
  message: {
    content: { type, data },
  },
}: {
  message: IMessage;
}) {
  assert(type === "text");

  return (
    <Text
      selectable
      style={{
        paddingVertical: 8,
        paddingHorizontal: 8,
      }}
      className="text-white font-poppins"
    >
      {data}
    </Text>
  );
}
