import { router } from "expo-router";
import { SelectForm } from "../../../components/forms";

export default function MealStep2Screen() {
  return (
    <SelectForm
      type="radio"
      title="How often do you plan your meals in advance?"
      options={[
        { name: "Never" },
        { name: "Rarely" },
        { name: "Occasionally" },
        { name: "Frequently" },
        { name: "Always" },
      ]}
      onSubmit={async () => {
        router.push("/step-3");
      }}
    />
  );
}
