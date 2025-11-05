import { useFormikContext } from "formik";
import { type Link, useRouter } from "expo-router";
import { createContext, useContext, useState } from "react";

type Screen = React.ComponentProps<typeof Link>["href"];

type ScreenContext = {
  onNext: (index?: number) => Promise<void>;
  setScreens: React.Dispatch<React.SetStateAction<Screen[]>>;
  screens: Screen[];
};

export const ScreenContext = createContext<ScreenContext | null>(null);

export function ScreenProvider({ children }: React.PropsWithChildren) {
  const router = useRouter();
  const { setStatus } = useFormikContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [screens, setScreens] = useState<Screen[]>([]);

  const onNext = async (presetIndex?: number) => {
    const index = presetIndex ? presetIndex : currentIndex;
    if (index < screens.length - 1) {
      const currentIndex = index + 1;
      router.navigate(screens[currentIndex]);
      setCurrentIndex(currentIndex);
    } else {
      router.dismissAll();
      setStatus("submit");
    }
  };

  return (
    <ScreenContext.Provider value={{ screens, setScreens, onNext }}>
      {children}
    </ScreenContext.Provider>
  );
}

export const useScreen = () => useContext(ScreenContext) as ScreenContext;
