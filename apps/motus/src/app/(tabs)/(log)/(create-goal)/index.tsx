import { Text } from "react-native";
import { array, object } from "yup";
import { router } from "expo-router";
import { useFormikContext } from "formik";

import Button from "../../../../components/Button";
import DumbBell from "../../../../assets/dumb-bell";
import { SelectForm } from "../../../../components/forms";
import { useScreen } from "../../../../components/create-goal";
import LoadingScreen from "../../../../components/loading/LoadingScreen";

export default function CreateGoalScreen() {
  const { setScreens } = useScreen();
  const { status } = useFormikContext();

  return (
    <>
      <SelectForm
        type="check"
        title="Let's know your goals"
        subtitle="What would you line to achieve with our app?"
        listTitle="Select up to 3"
        validationSchema={object().shape({ options: array().min(1).max(3) })}
        onSubmit={async (options) => {
          setScreens(Array.from(new Set(options.map((option) => option.type))));
          router.push("/step-0");
        }}
        options={
          [
            {
              type: "/(weight)",
              name: "Loss weight",
            },
            {
              type: "/(weight)",
              name: "Maintain weight",
            },
            {
              type: "/(weight)",
              name: "Gain weight",
            },
            {
              type: "/(weight)",
              name: "Gain muscle",
            },
            {
              type: "/(meal)",
              name: "Modify my diet",
            },
            {
              type: "/(meal)",
              name: "Plan meals",
            },
            {
              type: "/(activity)",
              name: "Manage stress",
            },
            {
              type: "/(activity)",
              name: "Stay active",
            },
          ] as const
        }
      />
      {["submitting", "successful"].includes(status) && (
        <LoadingScreen
          className="bg-black"
          title="Great Work"
          subtitle="Creating a personalised plan for you..."
          child={
            status === "successful" && (
              <>
                <DumbBell />
                <Text className="text-white font-poppins">
                  Your Plan has been created
                </Text>
                <Button
                  text="Continue"
                  style={{ paddingHorizontal: 32 }}
                  onPress={() => router.dismiss()}
                />
              </>
            )
          }
        />
      )}
    </>
  );
}
