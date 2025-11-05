import assert from "assert";
import { Image } from "expo-image";

import type { IMessage } from "../../store/message";

export function MessageImage({ message: { content } }: { message: IMessage }) {
  assert(content.type === "image");

  return (
    <Image
      source={{ uri: content.data }}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
