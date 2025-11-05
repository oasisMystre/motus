import { router } from "expo-router";
import { SelectForm } from "../../../../../components/forms";
import { useFormikContext } from "formik";

export default function WeightStep1Screen() {
  const { setFieldValue } = useFormikContext();

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
      onSubmit={async (data) => {
        setFieldValue("questions.weight.0", {
          question: "What are your reasons for wanting to gain weight",
          answer: data,
        });
        router.push("/step-1");
      }}
    />
  );
}
