import { SelectForm } from "../../../components/forms";
import { useScreen } from "../../../components/create-goal";

export default function WeightStep2Screen() {
  const { onNext } = useScreen();

  return (
    <SelectForm
      type="radio"
      title="What is your weekly goal"
      subtitle="Select one"
      options={[
        {
          name: "Gain 0.25kg per week",
        },
        {
          name: "Gain 0.5kg per week",
        },
      ]}
      onSubmit={async () => {
        onNext();
      }}
    />
  );
}
