import { router } from "expo-router";
import { InfoScreen } from "../../../../../components/create-goal";

export default function MealStep3Screen() {
  return (
    <InfoScreen
      title="A little planning, a lot of living"
      description="We'll help you bank small wins (and mighty celebrations) on the way to your goals"
      onNext={() => router.push("/step-4")}
      style={{ height: 200 }}
    />
  );
}
