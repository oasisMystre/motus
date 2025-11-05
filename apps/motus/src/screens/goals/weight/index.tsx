import { router } from "expo-router";
import { SelectForm } from "../../../components/forms";

export default function WeightScreen() {
  return (
    <SelectForm
      type="check"
      subtitle="Select all that apply"
      title="What are your reasons for wanting to gain weight"
      options={[
        { name: "Competitive sport performance" },
        { name: "Gain muscle for general fitness" },
        { name: "I am underweight" },
        { name: "My health provider recommended it" },
        { name: "Others" },
      ]}
      onSubmit={async () => router.push("/step-1")}
    />
  );
}
