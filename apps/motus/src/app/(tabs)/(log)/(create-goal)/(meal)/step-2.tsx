import { router } from "expo-router";
import { useFormikContext } from "formik";

import { SelectForm } from "../../../../../components/forms";

export default function MealStep2Screen() {
  const { setFieldValue } = useFormikContext();

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
      onSubmit={async (data) => {
        setFieldValue("questions.meal.1", {
          question: "How often do you plan your meals in advance?",
          answer: data,
        });
        router.push("/step-3");
      }}
    />
  );
}
