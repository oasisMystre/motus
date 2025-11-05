import { router } from "expo-router";
import { useFormikContext } from "formik";

import { MultipleOptionForm } from "../../../../../components/forms";

export default function MealStep1Screen() {
  const { setFieldValue } = useFormikContext();

  return (
    <MultipleOptionForm
      title="What are your reasons for wanting to gain weight?"
      data={[
        {
          title: "Select all that apply",
          data: [
            { name: "Track macros" },
            { name: "Plan more meals" },
            { name: "Move more" },
            { name: "Track calories" },
            { name: "Eat a balanced diet" },
          ],
        },
        {
          title: "More healty habits",
          data: [
            { name: "Track nurients" },
            { name: "Eat mindfully" },
            { name: "Eat whole food" },
            { name: "Eat more protein" },
            { name: "Eat more fiber" },
            { name: "Eat more vegetables" },
            { name: "Eat more fruits" },
            { name: "Drink more water" },
            { name: "Sleep more" },
            { name: "Workout more" },
            { name: "Something else" },
            { name: "I'm not sure" },
          ],
        },
      ]}
      onNext={(data) => {
        setFieldValue("questions.meal.0", {
          question: "What are your reasons for wanting to gain weight?",
          answer: data,
        });
        router.push("/step-1");
      }}
    />
  );
}
