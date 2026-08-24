import assert from "assert";
import Markdown from "react-native-markdown-display";

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
    <Markdown
      mergeStyle
      style={{
        body: {
          color: "white",
          paddingHorizontal: 8,
          fontFamily: "Poppins",
        },
      }}
    >
      {data}
    </Markdown>
  );
}
