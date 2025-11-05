import { useEffect, useRef } from "react";
import BackgroundTimer from "react-native-background-timer";

export default function useTimer(onTick: (duration: number) => void) {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = BackgroundTimer.setInterval(() => onTick(1000), 1000);

    return () => {
      if (intervalRef.current)
        BackgroundTimer.clearInterval(intervalRef.current);
    };
  }, [onTick]);
}
