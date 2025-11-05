import { useEffect, useState } from "react";
import { Dimensions } from "react-native";

export default function useDimensions(
  ...args: Parameters<typeof Dimensions.get>
) {
  const [dimension, setDimension] = useState(Dimensions.get(...args));
  useEffect(() => {
    const unsubscribe = Dimensions.addEventListener("change", (scale) => {
      setDimension(scale[args[0]]);
    });

    return () => unsubscribe.remove();
  }, []);

  return dimension;
}
