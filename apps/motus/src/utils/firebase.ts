import type { useTranslation } from "react-i18next";
import {
  getDownloadURL,
  type getStorage,
  ref,
  uploadBytesResumable,
} from "@react-native-firebase/storage";

export function getFirebaseErrorMessage<T extends { code: string }>(
  error: T,
  t?: ReturnType<typeof useTranslation>["t"],
) {
  let message: string | undefined;

  if ("code" in error) {
    if (error.code) {
      message = error.code.split(/\//).at(-1)?.replace(/-/, " ");
      if (t) {
        const errors = t("firebase.error", {
          returnObjects: true,
        }) as Record<string, string>;

        message = errors[error.code] ? errors[error.code] : message;
      }
    }
  }

  if (!message && t) message = t("firebase.error.auth/custom-error");
  if (!message) message = "An unexpected error occurred. Try again!";

  return message;
}

export async function uploadImageFromUri(
  storage: ReturnType<typeof getStorage>,
  uri: string,
  options: { fileName: string },
) {
  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(storage, options.fileName);
  const task = uploadBytesResumable(storageRef, blob);

  return new Promise<string>((resolve, reject) => {
    task.on(
      "state_changed",
      null,
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(storageRef);
        resolve(url);
      },
    );
  });
}
