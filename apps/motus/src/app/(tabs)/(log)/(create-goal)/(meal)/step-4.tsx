import { useFormikContext } from "formik";

import { SelectForm } from "../../../../../components/forms";
import { useScreen } from "../../../../../components/create-goal";

export default function MealStep4Screen() {
  const { onNext } = useScreen();
  const { setFieldValue } = useFormikContext();

  return (
    <SelectForm
      type="radio"
      title="Do you want us to help you build weekly meal plans"
      subtitle="The plan will be tailored to your goals"
      options={[
        {
          name: "Yes, definitely",
        },
        { name: "Open to trying" },
        { name: "No thanks" },
      ]}
      onSubmit={async (data) => {
        setFieldValue("questions.meal.2", {
          question: "Do you want us to help you build weekly meal plans",
          answer: data,
        });
        onNext();
      }}
    />
  );
}
