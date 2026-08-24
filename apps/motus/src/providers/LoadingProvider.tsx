import clsx from "clsx";
import type { ViewStyle } from "react-native";
import { createContext, useContext, useState } from "react";

import LoadingScreen from "../components/loading/LoadingScreen";

type LoadingOptions = {
  title?: string;
  subtitle?: string;
  className?: string;
  style?: ViewStyle;
};

type LoadingContext = {
  hide: () => void;
  promise: <T extends Promise<unknown>>(
    value: T,
    options?: LoadingOptions,
  ) => Promise<unknown>;
  show: (options?: LoadingOptions) => void;
};

export const LoadingContext = createContext<LoadingContext | null>(null);

export default function LoadingProvider({ children }: React.PropsWithChildren) {
  const [options, setOptions] = useState<LoadingOptions | null>(null);

  return (
    <LoadingContext.Provider
      value={{
        show: (options = {}) => setOptions(options),
        hide: () => setOptions(null),
        async promise(fn, options = {}) {
          setOptions(options);
          fn.finally(() => setOptions(null));
        },
      }}
    >
      {options && (
        <LoadingScreen
          {...options}
          className={clsx("bg-black z-50", options?.className)}
        />
      )}
      {children}
    </LoadingContext.Provider>
  );
}

export const withLoading =
  <T extends React.ElementType>(Component: T) =>
  (props: React.ComponentProps<T>) => (
    <LoadingProvider>
      <Component {...props} />
    </LoadingProvider>
  );
export const useLoading = () => useContext(LoadingContext) as LoadingContext;
