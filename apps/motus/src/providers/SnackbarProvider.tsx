import clsx from "clsx";
import { createContext, useContext, useEffect, useState } from "react";
import {
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

type SnackbarOptions = {
  text: string;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
  textAttrs?: {
    className?: string;
    style?: StyleProp<TextStyle>;
  };
};

type SnackbarContext = {
  show: (options: SnackbarOptions) => void;
  error: (options: SnackbarOptions) => void;
  success: (options: SnackbarOptions) => void;
  warning: (options: SnackbarOptions) => void;
};

const SnackbarContext = createContext<SnackbarContext | null>(null);

const defaultClassNames = {
  default: {
    className: "bg-primary",
    text: { className: "text-white" },
  },
  error: {
    className: "bg-red-500",
    text: { className: "text-white" },
  },
  success: {
    className: "bg-green-500",
    text: { className: "text-white" },
  },
  warning: {
    className: "bg-amber-500",
    text: { className: "text-white" },
  },
};

export default function SnackbarProvider({
  children,
}: React.PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [queue, setQueue] = useState<SnackbarOptions[]>([]);
  const [current, setCurrent] = useState<SnackbarOptions | null>(null);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(visible ? 1 : 0, { duration: 300 }),
      transform: [
        {
          translateY: withTiming(visible ? 0 : -100, {
            duration: 300,
            easing: Easing.out(Easing.ease),
          }),
        },
      ],
    };
  }, [visible]);

  const showSnackbar = (
    key: keyof typeof defaultClassNames,
    options: SnackbarOptions,
  ) =>
    setQueue((queue) => [
      ...queue,

      {
        ...options,
        duration: options.duration || 4000,
        textAttrs: {
          ...options.textAttrs,
          className:
            options.textAttrs?.className ||
            defaultClassNames[key].text.className,
        },
        className: options.className || defaultClassNames[key].className,
      },
    ]);

  useEffect(() => {
    if (queue.length > 0 && !current) {
      const [next, ...rest] = queue;
      setQueue(rest);
      setCurrent(next);
      setVisible(true);

      if (next.duration !== Infinity)
        setTimeout(() => {
          setVisible(false);
          setTimeout(() => setCurrent(null), 400);
        }, next.duration);
    }
  }, [queue, current]);

  return (
    <SnackbarContext.Provider
      value={{
        show: (options) => showSnackbar("default", options),
        error: (options) => showSnackbar("error", options),
        warning: (options) => showSnackbar("warning", options),
        success: (options) => showSnackbar("success", options),
      }}
    >
      <>
        {current && (
          <Animated.View
            className={clsx(
              "absolute top-0 inset-x-0 z-50 p-4",
              current.className,
            )}
            style={[
              { paddingTop: insets.top + 8, zIndex: 9999 },
              animatedStyle,
              current.style,
            ]}
          >
            <Text
              className={clsx(
                "font-poppins first-letter:capitalize",
                current.textAttrs?.className,
              )}
              style={current.textAttrs?.style}
            >
              {current.text.trim().slice(0, 1).toLocaleUpperCase() +
                current.text.slice(1)}
            </Text>
          </Animated.View>
        )}
        {children}
      </>
    </SnackbarContext.Provider>
  );
}

export const useSnackbar = () => useContext(SnackbarContext) as SnackbarContext;
