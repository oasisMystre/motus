import { router } from "expo-router";
import { InfoScreen } from "../../../components/create-goal";

export default function WeightStep1Screen() {
  return (
    <InfoScreen
      title="Dialing in your nutrition is a great way to get to the next level"
      description="Did you know that tracking your food is a scientifically proven method to be successful? It's called Self-monitoring and the more consistent you are, the more likely you are to hit your goals."
      onNext={() => router.push("/step-2")}
    />
  );
}
