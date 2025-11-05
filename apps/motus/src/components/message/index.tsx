import type { IMessage } from "../../store/message";

import { MessageText } from "./MessageText";
import { MessageImage } from "./MessageImage";
import { MessageObject } from "./MessageObject";

export default function Message({ message }: { message: IMessage }) {
  if (message.content.type === "text") return <MessageText message={message} />;
  else if (message.content.type === "image")
    return <MessageImage message={message} />;
  else return <MessageObject message={message} />;
}
