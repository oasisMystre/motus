import { useFormikContext } from "formik";

import { SelectForm } from "../../../../../components/forms";
import { useScreen } from "../../../../../components/create-goal";

export default function WeightStep2Screen() {
  const { onNext } = useScreen();
  const { setFieldValue } = useFormikContext();

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
        {
          name: "Loss 0.25kg per week",
        },
        {
          name: "Loss 0.5kg per week",
        },
      ]}
      onSubmit={async (data) => {
        setFieldValue("questions.weight.1", {
          question: "What is your weekly goal",
          answer: data,
        });

        onNext();
      }}
    />
  );
}
