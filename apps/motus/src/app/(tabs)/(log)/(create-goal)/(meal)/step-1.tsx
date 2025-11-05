import { router } from "expo-router";
import { InfoScreen } from "../../../../../components/create-goal";

export default function MealStep1Screen() {
  return (
    <InfoScreen
      title="Small habits = mighty change"
      description="We'll help you bank small wins (and mighty celebrations) on the way to your goals"
      onNext={() => router.push("/step-2")}
      style={{ height: 200 }}
    />
  );
}
