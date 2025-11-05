import { InfoScreen, useScreen } from "../../../../components/create-goal";

export default function Step0Screen() {
  const { onNext } = useScreen();

  return (
    <InfoScreen
      title="Great! You've just taken a big step on your journey."
      description="Did you know that tracking your food is a scientifically proven method to being successful? It's called self-monitoring and the more consistent you are, the more likely you are to hit your goals."
      onNext={() => onNext(-1)}
    />
  );
}
