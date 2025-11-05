import { SelectForm } from "../../../components/forms";
import { useScreen } from "../../../components/create-goal";

export default function ActivityScreen() {
  const { onNext } = useScreen();

  return (
    <SelectForm
      type="radio"
      title="What is your baseline activity level?"
      subtitle="Choose what describes you best"
      options={[
        {
          name: "Not very active",
          description: "Spend most of the day sitting.",
        },
        {
          name: "Lightly active",
          description: "Spend a good part of the day on your feet",
        },
        {
          name: "Active",
          description:
            "Spend a good part of the day doing some physical activities",
        },
        {
          name: "Very active",
          description:
            "Spend a good part of the day doing heavy phsical activities",
        },
      ]}
      onSubmit={async () => {
        onNext();
      }}
    />
  );
}
